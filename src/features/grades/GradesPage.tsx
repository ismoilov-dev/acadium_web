import { BellRing, Star } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Field } from '@/components/shared/Field'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGroup } from '@/hooks/useGroups'
import { useHomeworkList } from '@/hooks/useHomework'
import { useStudents } from '@/hooks/useStudents'
import { fmtDate } from '@/lib/date'

import { Gradebook } from './Gradebook'

const GENERAL = '__general__'

export default function GradesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const groupId = params.get('group') ?? undefined
  const homeworkId = params.get('hw') ?? undefined
  const students = useStudents()
  const group = useGroup(groupId)
  const hw = useHomeworkList(groupId)

  const members = useMemo(() => {
    if (!groupId) return []
    if (group.data?.students.length) {
      // Prefer the richer /students rows (may include grades) when ids match.
      const byId = new Map((students.data ?? []).map((s) => [s.id, s]))
      return group.data.students.map((s) => byId.get(s.id) ?? s)
    }
    return (students.data ?? []).filter((s) => s.group_id === groupId)
  }, [groupId, group.data, students.data])

  const set = (key: string, value?: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'group') next.delete('hw')
    setParams(next, { replace: true })
  }

  const homework = [...(hw.data ?? [])].sort((a, b) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? ''),
  )

  return (
    <>
      <PageHeader title={t('nav.grades')} description={t('grades.subtitle')} />
      <Card className="mb-4 grid gap-4 p-4 sm:grid-cols-2">
        <Field label={t('grades.step1')} htmlFor="gb-group">
          <GroupSelect id="gb-group" value={groupId} onChange={(v) => set('group', v)} />
        </Field>
        <Field label={t('grades.step2')} htmlFor="gb-hw">
          <Select
            value={homeworkId ?? GENERAL}
            onValueChange={(v) => set('hw', v === GENERAL ? undefined : v)}
            disabled={!groupId}
          >
            <SelectTrigger id="gb-hw">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GENERAL}>{t('grades.general')}</SelectItem>
              {homework.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.title}
                  {h.deadline && (
                    <span className="ml-2 text-xs text-ink-mute">{fmtDate(h.deadline)}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <p className="flex items-center gap-2 text-sm font-semibold text-tint-foreground sm:col-span-2">
          <BellRing className="size-4" /> {t('grades.notifyNote')}
        </p>
      </Card>

      <Card className="overflow-hidden">
        {!groupId ? (
          <EmptyState
            icon={Star}
            title={t('grades.pickGroup')}
            description={t('grades.pickGroupHint')}
          />
        ) : students.error ? (
          <ErrorState error={students.error} onRetry={() => void students.refetch()} />
        ) : (
          <Gradebook
            key={`${groupId}:${homeworkId ?? ''}`}
            students={members}
            homeworkId={homeworkId}
            loading={students.isLoading}
          />
        )}
      </Card>
    </>
  )
}
