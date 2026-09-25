import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Check, Loader2, Save } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { gradesApi } from '@/api/grades'
import { PersonCell } from '@/components/shared/PersonCell'
import { EmptyState, ListSkeleton } from '@/components/shared/States'
import { ScoreBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { qk } from '@/hooks/keys'
import { errorMessage } from '@/lib/errors'
import { gradeCache } from '@/lib/gradeCache'
import { fullName } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { Student } from '@/types'

interface Row {
  score: string
  comment: string
  gradeId?: string
  savedScore?: number
  savedComment?: string
  state: 'idle' | 'saving' | 'saved' | 'error'
  error?: string
}

function initialRow(s: Student, homeworkId?: string): Row {
  const server = homeworkId ? s.grades.find((g) => g.homework_id === homeworkId) : undefined
  const cached = gradeCache.get(s.id, homeworkId)
  // General grades (no homework) are separate entries each time, so we start blank.
  const known = homeworkId
    ? (server ?? (cached && { id: cached.id, score: cached.score, comment: cached.comment }))
    : undefined
  return {
    score: known ? String(known.score) : '',
    comment: known?.comment ?? '',
    gradeId: known?.id,
    savedScore: known?.score,
    savedComment: known?.comment ?? '',
    state: 'idle',
  }
}

function parseScore(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : NaN
}

/**
 * Fast grading grid: one row per student, score 0–100 + comment.
 * Enter → next student's score; Tab walks score → comment → next row; Ctrl/⌘+S saves all.
 */
export function Gradebook({
  students,
  homeworkId,
  loading,
}: {
  students: Student[]
  homeworkId?: string
  loading?: boolean
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const sorted = useMemo(
    () => [...students].sort((a, b) => fullName(a).localeCompare(fullName(b))),
    [students],
  )
  const [rows, setRows] = useState<Record<string, Row>>({})
  const scoreRefs = useRef<(HTMLInputElement | null)[]>([])
  const [savingAll, setSavingAll] = useState(false)

  const rowOf = (s: Student): Row => rows[s.id] ?? initialRow(s, homeworkId)
  const patch = (id: string, s: Student, p: Partial<Row>) =>
    setRows((r) => ({ ...r, [id]: { ...(r[id] ?? initialRow(s, homeworkId)), ...p } }))

  const isDirty = (r: Row) => {
    const n = parseScore(r.score)
    if (n === null) return false
    return n !== r.savedScore || r.comment.trim() !== (r.savedComment ?? '')
  }

  const dirtyStudents = sorted.filter((s) => isDirty(rowOf(s)))

  async function saveRow(s: Student): Promise<boolean> {
    const r = rowOf(s)
    const score = parseScore(r.score)
    if (score === null) return true
    if (Number.isNaN(score)) {
      patch(s.id, s, { state: 'error', error: t('validation.score') })
      return false
    }
    patch(s.id, s, { state: 'saving', error: undefined })
    const comment = r.comment.trim()
    try {
      const saved = r.gradeId
        ? await gradesApi.update(r.gradeId, { score, comment })
        : await gradesApi.create({
            student_id: s.id,
            homework_id: homeworkId,
            score,
            comment: comment || undefined,
          })
      const id = saved.id || r.gradeId
      if (id) gradeCache.put(s.id, homeworkId, { id, score, comment })
      patch(
        s.id,
        s,
        homeworkId
          ? { state: 'saved', gradeId: id, savedScore: score, savedComment: comment }
          : {
              state: 'saved',
              gradeId: undefined,
              savedScore: score,
              savedComment: comment,
              score: '',
              comment: '',
            },
      )
      return true
    } catch (err) {
      patch(s.id, s, { state: 'error', error: errorMessage(err, t) })
      return false
    }
  }

  async function saveAll() {
    if (!dirtyStudents.length) return
    setSavingAll(true)
    let ok = 0
    // Small batches keep the server happy and give quick visual feedback.
    for (let i = 0; i < dirtyStudents.length; i += 4) {
      const res = await Promise.all(dirtyStudents.slice(i, i + 4).map(saveRow))
      ok += res.filter(Boolean).length
    }
    setSavingAll(false)
    void qc.invalidateQueries({ queryKey: qk.students })
    const failed = dirtyStudents.length - ok
    if (failed) toast.error(t('grades.savedPartial', { ok, failed }))
    else toast.success(t('grades.savedAll', { count: ok }))
  }

  const onScoreKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (e.key === 'Enter' && e.shiftKey) void saveRow(sorted[i])
      scoreRefs.current[i + 1]?.focus()
      scoreRefs.current[i + 1]?.select()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      scoreRefs.current[i - 1]?.focus()
      scoreRefs.current[i - 1]?.select()
    }
  }

  if (loading) return <ListSkeleton rows={6} />
  if (!sorted.length)
    return <EmptyState title={t('grades.noStudents')} description={t('grades.noStudentsHint')} />

  return (
    <div
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
          e.preventDefault()
          void saveAll()
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-soft px-4 py-3">
        <p className="text-sm text-ink-soft">
          {t('grades.keyboardHint')}{' '}
          <kbd className="rounded border bg-card px-1.5 py-0.5 text-xs font-bold">Enter</kbd>{' '}
          <kbd className="rounded border bg-card px-1.5 py-0.5 text-xs font-bold">⌘/Ctrl + S</kbd>
        </p>
        <Button onClick={() => void saveAll()} loading={savingAll} disabled={!dirtyStudents.length}>
          {!savingAll && <Save />} {t('grades.saveAll')}{' '}
          {dirtyStudents.length > 0 && `(${dirtyStudents.length})`}
        </Button>
      </div>
      <ul className="divide-y">
        {sorted.map((s, i) => {
          const r = rowOf(s)
          const dirty = isDirty(r)
          const n = parseScore(r.score)
          const invalid = Number.isNaN(n)
          return (
            <li
              key={s.id}
              className={cn(
                'grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[2rem_minmax(180px,1.2fr)_110px_minmax(160px,1.5fr)_auto]',
                dirty && 'bg-tint/40',
              )}
            >
              <span className="tabular hidden text-right text-sm font-bold text-ink-mute md:block">
                {i + 1}
              </span>
              <div className="col-span-2 min-w-0 md:col-span-1">
                <PersonCell
                  person={s}
                  sub={
                    r.savedScore !== undefined ? (
                      <span className="inline-flex items-center gap-1.5">
                        {homeworkId ? t('grades.current') : t('grades.last')}:{' '}
                        <ScoreBadge score={r.savedScore} className="px-1.5 py-0 text-[.68rem]" />
                      </span>
                    ) : undefined
                  }
                />
              </div>
              <Input
                ref={(el) => {
                  scoreRefs.current[i] = el
                }}
                inputMode="decimal"
                placeholder="0–100"
                aria-label={t('grades.score')}
                aria-invalid={invalid}
                value={r.score}
                onChange={(e) =>
                  patch(s.id, s, {
                    score: e.target.value.replace(/[^\d.,]/g, '').slice(0, 5),
                    state: 'idle',
                  })
                }
                onKeyDown={(e) => onScoreKey(e, i)}
                onFocus={(e) => e.target.select()}
                className="tabular text-center text-base font-extrabold"
              />
              <Input
                placeholder={t('grades.commentPlaceholder')}
                aria-label={t('grades.comment')}
                value={r.comment}
                onChange={(e) => patch(s.id, s, { comment: e.target.value, state: 'idle' })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void saveRow(s)
                    scoreRefs.current[i + 1]?.focus()
                  }
                }}
              />
              <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1 md:w-28">
                {r.state === 'saving' && <Loader2 className="size-4 animate-spin text-primary" />}
                {r.state === 'saved' && !dirty && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-ok">
                    <Check className="size-4" /> {t('common.saved')}
                  </span>
                )}
                {r.state === 'error' && (
                  <span
                    title={r.error}
                    className="inline-flex items-center gap-1 text-xs font-bold text-bad"
                  >
                    <AlertCircle className="size-4" /> {t('grades.error')}
                  </span>
                )}
                <Button
                  size="sm"
                  variant={dirty ? 'default' : 'outline'}
                  tabIndex={-1}
                  disabled={!dirty || invalid || r.state === 'saving'}
                  onClick={() => void saveRow(s)}
                >
                  {t('common.save')}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
