import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightLeft, CalendarCheck, Star, UserRound, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PersonCell } from '@/components/shared/PersonCell'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { AttendanceBadge, ScoreBadge, UserStatusBadge } from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGroups } from '@/hooks/useGroups'
import { useMoveStudent, useStudent, useUpdateStudent } from '@/hooks/useStudents'
import { fmtDate, fmtDateTime } from '@/lib/date'
import { formatPhone } from '@/lib/phone'
import { fullName, initials } from '@/lib/roles'
import { requiredText } from '@/lib/schemas'
import type { Student } from '@/types'

export function StudentDrawer({
  id,
  fallback,
  onClose,
}: {
  id?: string
  fallback?: Student
  onClose: () => void
}) {
  const { t } = useTranslation()
  const q = useStudent(id)
  const student = q.data ?? fallback

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <DialogTitle className="sr-only">{fullName(student)}</DialogTitle>
        <DialogDescription className="sr-only">{t('students.detail')}</DialogDescription>
        {!student && q.isLoading ? (
          <ListSkeleton className="mt-12" />
        ) : !student ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} className="mt-12" />
        ) : (
          <StudentBody student={student} loadingDetail={q.isFetching && !q.data} />
        )}
      </SheetContent>
    </Dialog>
  )
}

function StudentBody({ student, loadingDetail }: { student: Student; loadingDetail: boolean }) {
  const { t } = useTranslation()
  const groups = useGroups()
  const groupName =
    student.group_name ??
    groups.data?.find((g) => g.id === student.group_id)?.name ??
    t('groups.noGroup')

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b bg-soft bg-hero px-6 pb-5 pt-10">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-[14px]">
            <AvatarFallback className="text-base">{initials(student)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold">{fullName(student)}</h2>
            <p className="tabular text-sm font-medium text-ink-soft">
              {formatPhone(student.phone)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge>{groupName}</Badge>
              <UserStatusBadge status={student.status} />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="flex-1 px-6 py-5">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile">
            <UserRound /> {t('students.tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="grades">
            <Star /> {t('students.tabs.grades')}
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <CalendarCheck /> {t('students.tabs.attendance')}
          </TabsTrigger>
          <TabsTrigger value="parents">
            <UsersRound /> {t('students.tabs.parents')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="grid gap-6">
          <ProfileForm student={student} />
          <MoveGroup key={student.group_id ?? 'none'} student={student} />
          <p className="text-xs text-ink-mute">
            {t('fields.createdAt')}: {fmtDate(student.created_at)}
          </p>
        </TabsContent>

        <TabsContent value="grades">
          {loadingDetail ? (
            <ListSkeleton rows={3} />
          ) : student.grades.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t('students.noGrades')}
              description={t('students.noGradesHint')}
            />
          ) : (
            <ul className="divide-y rounded-xl border">
              {student.grades.map((g) => (
                <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {g.homework_title ?? t('grades.general')}
                    </p>
                    {g.comment && <p className="truncate text-sm text-ink-soft">{g.comment}</p>}
                    <p className="tabular text-xs text-ink-mute">{fmtDateTime(g.created_at)}</p>
                  </div>
                  <ScoreBadge score={g.score} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="attendance">
          {loadingDetail ? (
            <ListSkeleton rows={3} />
          ) : student.attendance.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={t('students.noAttendance')}
              description={t('students.noAttendanceHint')}
            />
          ) : (
            <ul className="divide-y rounded-xl border">
              {student.attendance.map((a) => (
                <li
                  key={a.id || a.date}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="tabular font-semibold">
                    {fmtDateTime(a.check_in_at ?? a.date)}
                  </span>
                  <AttendanceBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="parents">
          {student.parents.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title={t('students.noParents')}
              description={t('students.noParentsHint')}
            />
          ) : (
            <ul className="divide-y rounded-xl border">
              {student.parents.map((p) => (
                <li key={p.id} className="px-4 py-3">
                  <PersonCell person={p} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileForm({ student }: { student: Student }) {
  const { t } = useTranslation()
  const schema = z.object({ first_name: requiredText(t), last_name: z.string() })
  type Values = z.infer<typeof schema>
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: { first_name: student.first_name, last_name: student.last_name ?? '' },
  })
  const update = useUpdateStudent()
  const { errors, isDirty } = form.formState

  return (
    <form
      onSubmit={form.handleSubmit((v) =>
        update.mutate({
          id: student.id,
          body: { first_name: v.first_name.trim(), last_name: v.last_name.trim() },
        }),
      )}
      className="grid gap-4 rounded-xl border p-4"
      noValidate
    >
      <p className="font-bold">{t('students.editProfile')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t('fields.firstName')}
          required
          error={errors.first_name?.message}
          htmlFor="sd-fn"
        >
          <Input id="sd-fn" {...form.register('first_name')} aria-invalid={!!errors.first_name} />
        </Field>
        <Field label={t('fields.lastName')} htmlFor="sd-ln">
          <Input id="sd-ln" {...form.register('last_name')} />
        </Field>
      </div>
      <Field label={t('fields.phone')} hint={t('students.phoneLocked')}>
        <Input value={formatPhone(student.phone)} disabled />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={update.isPending} disabled={!isDirty}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}

function MoveGroup({ student }: { student: Student }) {
  const { t } = useTranslation()
  const [groupId, setGroupId] = useState(student.group_id)
  const move = useMoveStudent()

  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <p className="font-bold">{t('students.changeGroup')}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <GroupSelect value={groupId} onChange={setGroupId} />
        </div>
        <Button
          variant="outline"
          disabled={!groupId || groupId === student.group_id}
          loading={move.isPending}
          onClick={() => groupId && move.mutate({ id: student.id, groupId })}
        >
          <ArrowRightLeft /> {t('students.move')}
        </Button>
      </div>
    </div>
  )
}
