import { ArrowLeft, CalendarClock, ExternalLink, Pencil, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState, ListSkeleton } from '@/components/shared/States'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBar } from '@/components/ui/card'
import { Gradebook } from '@/features/grades/Gradebook'
import { useGroup } from '@/hooks/useGroups'
import { useDeleteHomework, useHomework } from '@/hooks/useHomework'
import { useStudents } from '@/hooks/useStudents'
import { fmtDateTime, fromNow } from '@/lib/date'

import { HomeworkFormDialog } from './HomeworkFormDialog'
import { HomeworkStateBadge } from './HomeworkStateBadge'

export default function HomeworkDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const q = useHomework(id)
  const hw = q.data
  const group = useGroup(hw?.group_id)
  const students = useStudents()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const del = useDeleteHomework()

  const members = useMemo(() => {
    if (!hw) return []
    const byId = new Map((students.data ?? []).map((s) => [s.id, s]))
    if (group.data?.students.length) return group.data.students.map((s) => byId.get(s.id) ?? s)
    return (students.data ?? []).filter((s) => s.group_id === hw.group_id)
  }, [hw, group.data, students.data])

  const back = (
    <Link
      to="/homework"
      className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> {t('nav.homework')}
    </Link>
  )

  if (!hw) {
    return (
      <>
        <PageHeader title={t('nav.homework')} back={back} />
        <Card>
          {q.isLoading ? (
            <ListSkeleton />
          ) : (
            <ErrorState error={q.error} onRetry={() => void q.refetch()} />
          )}
        </Card>
      </>
    )
  }

  const groupName = hw.group_name ?? group.data?.name

  return (
    <>
      <PageHeader
        back={back}
        title={hw.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {groupName && (
              <Link to={`/groups/${hw.group_id}`}>
                <Badge>{groupName}</Badge>
              </Link>
            )}
            <HomeworkStateBadge hw={hw} />
          </span>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> {t('common.edit')}
            </Button>
            <Button
              variant="outline"
              className="text-bad hover:border-bad"
              onClick={() => setDeleting(true)}
              aria-label={t('common.delete')}
            >
              <Trash2 />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="order-2 overflow-hidden xl:order-1">
          <CardBar
            title={
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />{' '}
                {t('homework.gradeStudents', { count: members.length })}
              </span>
            }
          />
          <Gradebook students={members} homeworkId={hw.id} loading={students.isLoading} />
        </Card>

        <Card className="order-1 h-fit p-5 xl:order-2">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-tint text-tint-foreground">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
                {t('homework.deadline')}
              </p>
              <p className="tabular font-bold">{fmtDateTime(hw.deadline)}</p>
              {hw.deadline && <p className="text-sm text-ink-soft">{fromNow(hw.deadline)}</p>}
            </div>
          </div>
          {hw.description && (
            <div className="mt-5 border-t pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
                {t('fields.description')}
              </p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{hw.description}</p>
            </div>
          )}
          {hw.file_url && (
            <Button variant="outline" className="mt-5 w-full" asChild>
              <a href={hw.file_url} target="_blank" rel="noreferrer">
                <ExternalLink /> {t('homework.openFile')}
              </a>
            </Button>
          )}
          <p className="mt-5 text-xs text-ink-mute">
            {t('fields.createdAt')}: {fmtDateTime(hw.created_at)}
          </p>
        </Card>
      </div>

      <HomeworkFormDialog open={editing} homework={hw} onOpenChange={setEditing} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t('homework.deleteTitle')}
        description={t('homework.deleteText', { title: hw.title })}
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(hw.id, { onSuccess: () => navigate('/homework', { replace: true }) })
        }
      />
    </>
  )
}
