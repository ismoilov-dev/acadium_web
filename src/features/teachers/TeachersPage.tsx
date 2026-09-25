import { Clock, Pencil, Plus, UserRound, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { DataTable, type Column } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { PersonCell } from '@/components/shared/PersonCell'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { WeekdayList } from '@/components/shared/WeekdayPicker'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { useGroups } from '@/hooks/useGroups'
import { useTeacher, useTeachers } from '@/hooks/useTeachers'
import { fmtTime } from '@/lib/date'
import { formatPhone } from '@/lib/phone'
import { fullName, initials } from '@/lib/roles'
import type { Group, Teacher } from '@/types'

import { AddTeacherDialog, EditTeacherDialog } from './TeacherDialogs'

export default function TeachersPage() {
  const { t } = useTranslation()
  const teachers = useTeachers()
  const groups = useGroups()
  const [params, setParams] = useSearchParams()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Teacher>()
  const openId = params.get('id') ?? undefined

  const groupsOf = useMemo(() => {
    const all = groups.data ?? []
    return (tc: Teacher): Group[] =>
      tc.groups.length ? tc.groups : all.filter((g) => g.teacher_id && g.teacher_id === tc.id)
  }, [groups.data])

  const columns: Column<Teacher>[] = [
    {
      id: 'name',
      header: t('fields.name'),
      cell: (tc) => <PersonCell person={tc} />,
      sortValue: (tc) => fullName(tc),
    },
    {
      id: 'phone',
      header: t('fields.phone'),
      cell: (tc) => (
        <span className="tabular whitespace-nowrap font-medium">{formatPhone(tc.phone)}</span>
      ),
      headClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell',
    },
    {
      id: 'spec',
      header: t('fields.specialization'),
      cell: (tc) =>
        tc.specialization ? (
          <Badge>{tc.specialization}</Badge>
        ) : (
          <span className="text-ink-mute">—</span>
        ),
      sortValue: (tc) => tc.specialization ?? '',
    },
    {
      id: 'groups',
      header: t('nav.groups'),
      cell: (tc) => <span className="tabular font-bold">{groupsOf(tc).length}</span>,
      sortValue: (tc) => groupsOf(tc).length,
      headClassName: 'hidden sm:table-cell',
      className: 'hidden sm:table-cell',
    },
    {
      id: 'actions',
      header: '',
      className: 'w-12 text-right',
      cell: (tc) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('common.edit')}
          onClick={(e) => {
            e.stopPropagation()
            setEditing(tc)
          }}
        >
          <Pencil />
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('nav.teachers')}
        description={t('teachers.subtitle', { count: teachers.data?.length ?? 0 })}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus /> {t('teachers.add')}
          </Button>
        }
      />
      <DataTable
        data={teachers.data}
        columns={columns}
        rowKey={(tc) => tc.id}
        loading={teachers.isLoading}
        error={teachers.error}
        onRetry={() => void teachers.refetch()}
        searchText={(tc) => `${fullName(tc)} ${tc.phone} ${tc.specialization ?? ''}`}
        initialSort={{ id: 'name' }}
        onRowClick={(tc) => setParams({ id: tc.id })}
        empty={
          <EmptyState
            icon={UserRound}
            title={t('teachers.empty')}
            description={t('teachers.emptyHint')}
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus /> {t('teachers.add')}
              </Button>
            }
          />
        }
      />
      <AddTeacherDialog open={adding} onOpenChange={setAdding} />
      <EditTeacherDialog teacher={editing} onOpenChange={(o) => !o && setEditing(undefined)} />
      <TeacherDrawer
        id={openId}
        fallback={teachers.data?.find((tc) => tc.id === openId)}
        groupsOf={groupsOf}
        onEdit={setEditing}
        onClose={() => setParams({})}
      />
    </>
  )
}

function TeacherDrawer({
  id,
  fallback,
  groupsOf,
  onEdit,
  onClose,
}: {
  id?: string
  fallback?: Teacher
  groupsOf: (t: Teacher) => Group[]
  onEdit: (t: Teacher) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const q = useTeacher(id)
  const teacher = q.data ?? fallback
  const groups = teacher ? groupsOf(teacher) : []

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <DialogTitle className="sr-only">{fullName(teacher)}</DialogTitle>
        <DialogDescription className="sr-only">{t('teachers.detail')}</DialogDescription>
        {!teacher && q.isLoading ? (
          <ListSkeleton className="mt-12" />
        ) : !teacher ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} className="mt-12" />
        ) : (
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="border-b bg-soft bg-hero px-6 pb-5 pt-10">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 rounded-[14px]">
                  {teacher.avatar_url && <AvatarImage src={teacher.avatar_url} alt="" />}
                  <AvatarFallback className="text-base">{initials(teacher)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-extrabold">{fullName(teacher)}</h2>
                  <p className="tabular text-sm font-medium text-ink-soft">
                    {formatPhone(teacher.phone)}
                  </p>
                  {teacher.specialization && (
                    <Badge className="mt-2">{teacher.specialization}</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => onEdit(teacher)}>
                <Pencil /> {t('common.edit')}
              </Button>
            </div>
            <div className="px-6 py-5">
              <p className="mb-3 font-bold">{t('teachers.groups')}</p>
              {groups.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={t('teachers.noGroups')}
                  description={t('teachers.noGroupsHint')}
                  className="rounded-xl border py-10"
                />
              ) : (
                <ul className="grid gap-2">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <Link
                        to={`/groups/${g.id}`}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-soft"
                      >
                        <span className="grid size-9 place-items-center rounded-sm bg-tint text-xs font-bold text-tint-foreground">
                          {g.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{g.name}</p>
                          <p className="tabular flex items-center gap-1 text-xs text-ink-soft">
                            <Clock className="size-3" /> {fmtTime(g.start_time)}–
                            {fmtTime(g.end_time)}
                          </p>
                        </div>
                        <WeekdayList days={g.days_of_week} className="hidden sm:inline-flex" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Dialog>
  )
}
