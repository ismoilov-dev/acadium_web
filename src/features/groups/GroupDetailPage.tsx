import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Video,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { PersonCell } from '@/components/shared/PersonCell'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { WeekdayList } from '@/components/shared/WeekdayPicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/AuthProvider'
import { AddStudentDialog } from '@/features/students/AddStudentDialog'
import { useDeleteGroup, useGroup, useVisibleGroups } from '@/hooks/useGroups'
import { useHomeworkList } from '@/hooks/useHomework'
import { useMoveStudent, useStudents } from '@/hooks/useStudents'
import { fmtDateTime, fmtTime, now } from '@/lib/date'
import { fullName, isAdmin } from '@/lib/roles'
import type { Group, Student } from '@/types'

import { GroupFormDialog } from './GroupFormDialog'

export default function GroupDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const admin = isAdmin(user)
  const navigate = useNavigate()
  const q = useGroup(id)
  const listQ = useVisibleGroups()
  const group = q.data ?? listQ.data?.find((g) => g.id === id)
  const students = useStudents()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const del = useDeleteGroup()

  const members = useMemo<Student[]>(() => {
    if (group?.students.length) return group.students
    return (students.data ?? []).filter((s) => s.group_id === id)
  }, [group, students.data, id])

  const back = (
    <Link
      to="/groups"
      className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> {admin ? t('nav.groups') : t('nav.myGroups')}
    </Link>
  )

  if (!group) {
    return (
      <>
        <PageHeader title={t('groups.detail')} back={back} />
        <Card>
          {q.isLoading || listQ.isLoading ? (
            <ListSkeleton />
          ) : (
            <ErrorState error={q.error} onRetry={() => void q.refetch()} />
          )}
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        back={back}
        title={group.name}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="tabular inline-flex items-center gap-1.5 font-semibold">
              <Clock className="size-4" /> {fmtTime(group.start_time)}–{fmtTime(group.end_time)}
            </span>
            <WeekdayList days={group.days_of_week} />
          </span>
        }
        actions={
          <>
            {group.online_url && (
              <Button variant="outline" asChild>
                <a href={group.online_url} target="_blank" rel="noreferrer">
                  <Video /> {t('groups.joinOnline')}
                </a>
              </Button>
            )}
            {admin && (
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
            )}
          </>
        }
      />

      {group.description && (
        <p className="-mt-3 mb-6 max-w-3xl text-ink-soft">{group.description}</p>
      )}

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">
            <GraduationCap /> {t('nav.students')} <Badge variant="muted">{members.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="homework">
            <BookOpenCheck /> {t('nav.homework')}
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <CalendarDays /> {t('groups.weekly')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <GroupStudents
            group={group}
            members={members}
            loading={students.isLoading && !group.students.length}
            admin={admin}
          />
        </TabsContent>
        <TabsContent value="homework">
          <GroupHomework groupId={group.id} />
        </TabsContent>
        <TabsContent value="schedule">
          <WeekStrip group={group} />
        </TabsContent>
      </Tabs>

      {admin && <GroupFormDialog open={editing} group={group} onOpenChange={setEditing} />}
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t('groups.deleteTitle', { name: group.name })}
        description={t('groups.deleteText')}
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(group.id, { onSuccess: () => navigate('/groups', { replace: true }) })
        }
      />
    </>
  )
}

function GroupStudents({
  group,
  members,
  loading,
  admin,
}: {
  group: Group
  members: Student[]
  loading: boolean
  admin: boolean
}) {
  const { t } = useTranslation()
  const [addNew, setAddNew] = useState(false)
  const [addExisting, setAddExisting] = useState(false)
  return (
    <Card>
      {admin && (
        <div className="flex flex-wrap gap-2 border-b p-3">
          <Button size="sm" onClick={() => setAddNew(true)}>
            <Plus /> {t('students.add')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAddExisting(true)}>
            <UserPlus /> {t('groups.addExisting')}
          </Button>
        </div>
      )}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={t('groups.noStudents')}
          description={admin ? t('groups.noStudentsHint') : undefined}
        />
      ) : (
        <ul className="divide-y">
          {members.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="tabular w-6 text-right text-sm font-bold text-ink-mute">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {admin ? (
                  <Link to={`/students?id=${s.id}`} className="block hover:opacity-80">
                    <PersonCell person={s} />
                  </Link>
                ) : (
                  <PersonCell person={s} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {admin && (
        <>
          <AddStudentDialog open={addNew} onOpenChange={setAddNew} defaultGroupId={group.id} />
          <MoveExistingDialog open={addExisting} onOpenChange={setAddExisting} group={group} />
        </>
      )}
    </Card>
  )
}

function MoveExistingDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  group: Group
}) {
  const { t } = useTranslation()
  const students = useStudents()
  const move = useMoveStudent()
  const [sid, setSid] = useState<string>()
  const candidates = (students.data ?? []).filter((s) => s.group_id !== group.id)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('groups.addExisting')}</DialogTitle>
          <DialogDescription>{t('groups.addExistingHint', { name: group.name })}</DialogDescription>
        </DialogHeader>
        <Select value={sid ?? ''} onValueChange={setSid}>
          <SelectTrigger>
            <SelectValue placeholder={t('groups.pickStudent')} />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {fullName(s)}
                <span className="ml-2 text-xs text-ink-mute">
                  {s.group_name ?? (s.group_id ? '' : t('groups.noGroup'))}
                </span>
              </SelectItem>
            ))}
            {candidates.length === 0 && (
              <div className="px-2.5 py-2 text-sm text-ink-mute">{t('states.empty')}</div>
            )}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!sid}
            loading={move.isPending}
            onClick={() =>
              sid &&
              move.mutate(
                { id: sid, groupId: group.id },
                {
                  onSuccess: () => {
                    setSid(undefined)
                    onOpenChange(false)
                  },
                },
              )
            }
          >
            {t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GroupHomework({ groupId }: { groupId: string }) {
  const { t } = useTranslation()
  const hw = useHomeworkList(groupId)
  const items = [...(hw.data ?? [])].sort((a, b) =>
    (b.deadline ?? b.created_at ?? '').localeCompare(a.deadline ?? a.created_at ?? ''),
  )
  return (
    <Card>
      <div className="flex flex-wrap gap-2 border-b p-3">
        <Button size="sm" asChild>
          <Link to={`/homework?new=1&group=${groupId}`}>
            <Plus /> {t('homework.create')}
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/grades?group=${groupId}`}>{t('grades.open')}</Link>
        </Button>
      </div>
      {hw.isLoading ? (
        <ListSkeleton rows={3} />
      ) : hw.error ? (
        <ErrorState error={hw.error} onRetry={() => void hw.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpenCheck} title={t('homework.empty')} />
      ) : (
        <ul className="divide-y">
          {items.map((h) => {
            const overdue = !!h.deadline && now().isAfter(h.deadline)
            return (
              <li key={h.id}>
                <Link
                  to={`/homework/${h.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-soft/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{h.title}</p>
                    <p className="tabular text-xs text-ink-mute">
                      {t('homework.deadline')}: {fmtDateTime(h.deadline)}
                    </p>
                  </div>
                  <Badge variant={overdue ? 'muted' : 'ok'}>
                    {overdue ? t('homework.closed') : t('homework.active')}
                  </Badge>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function WeekStrip({ group }: { group: Group }) {
  const { t } = useTranslation()
  const today = now().isoWeekday()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {[1, 2, 3, 4, 5, 6, 7].map((d) => {
        const on = group.days_of_week.includes(d)
        return (
          <div
            key={d}
            className={
              on
                ? 'rounded-xl border border-transparent bg-brand p-4 text-white shadow-btn'
                : 'rounded-xl border bg-card p-4 text-ink-mute'
            }
          >
            <p className="text-sm font-bold">
              {t(`weekdays.long.${d}`)}
              {d === today && (
                <span className="ml-1.5 text-xs opacity-80">• {t('groups.today')}</span>
              )}
            </p>
            <p className="tabular mt-3 text-lg font-extrabold">
              {on ? `${fmtTime(group.start_time)}–${fmtTime(group.end_time)}` : '—'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
