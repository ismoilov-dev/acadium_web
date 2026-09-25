import {
  BookOpenCheck,
  GraduationCap,
  Plus,
  Star,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ListSkeleton } from '@/components/shared/States'
import { StatCard } from '@/components/shared/StatCard'
import { ScoreBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthProvider'
import { HomeworkStateBadge } from '@/features/homework/HomeworkStateBadge'
import { useCenter, useMembers } from '@/hooks/useCenter'
import { useGroups } from '@/hooks/useGroups'
import { useHomeworkList } from '@/hooks/useHomework'
import { useStudents } from '@/hooks/useStudents'
import { useTeachers } from '@/hooks/useTeachers'
import { fmtDateTime, fromNow, now } from '@/lib/date'
import { fullName } from '@/lib/roles'

import { TodayAttendanceCard } from './TodayAttendanceCard'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const center = useCenter()
  const students = useStudents()
  const teachers = useTeachers()
  const members = useMembers()
  const groups = useGroups()
  const hw = useHomeworkList()

  const parents = (members.data ?? []).filter((m) => m.role === 'PARENT').length
  const groupName = useMemo(
    () => new Map((groups.data ?? []).map((g) => [g.id, g.name])),
    [groups.data],
  )
  const recentHw = [...(hw.data ?? [])]
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, 5)
  const recentGrades = useMemo(
    () =>
      (students.data ?? [])
        .flatMap((s) =>
          s.grades.map((g) => ({ ...g, student_name: g.student_name ?? fullName(s) })),
        )
        .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
        .slice(0, 5),
    [students.data],
  )

  const hour = now().hour()
  const greet =
    hour < 12
      ? t('dashboard.morning')
      : hour < 18
        ? t('dashboard.afternoon')
        : t('dashboard.evening')

  return (
    <>
      <PageHeader
        title={`${greet}, ${user?.first_name ?? ''}!`}
        description={
          center.data?.name
            ? t('dashboard.centerLine', { name: center.data.name })
            : t('dashboard.subtitle')
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/students">
                <Plus /> {t('students.add')}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/homework?new=1">
                <BookOpenCheck /> {t('homework.create')}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('nav.students')}
          value={students.data?.length ?? 0}
          icon={GraduationCap}
          to="/students"
          loading={students.isLoading}
        />
        <StatCard
          label={t('nav.teachers')}
          value={teachers.data?.length ?? 0}
          icon={UserRound}
          to="/teachers"
          loading={teachers.isLoading}
        />
        <StatCard
          label={t('nav.parents')}
          value={parents}
          icon={UsersRound}
          to="/parents"
          loading={members.isLoading}
        />
        <StatCard
          label={t('nav.groups')}
          value={groups.data?.length ?? 0}
          icon={Users}
          to="/groups"
          loading={groups.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <TodayAttendanceCard />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentHomework')}</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/homework">{t('common.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {hw.isLoading ? (
                <ListSkeleton rows={3} />
              ) : recentHw.length === 0 ? (
                <EmptyState icon={BookOpenCheck} title={t('homework.empty')} className="py-8" />
              ) : (
                <ul>
                  {recentHw.map((h) => (
                    <li key={h.id}>
                      <Link
                        to={`/homework/${h.id}`}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-soft"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{h.title}</p>
                          <p className="truncate text-xs text-ink-mute">
                            {h.group_name ?? groupName.get(h.group_id) ?? '—'} ·{' '}
                            {fmtDateTime(h.deadline)}
                          </p>
                        </div>
                        <HomeworkStateBadge hw={h} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentGrades')}</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/grades">{t('grades.open')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {students.isLoading ? (
                <ListSkeleton rows={3} />
              ) : recentGrades.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title={t('dashboard.noGrades')}
                  description={t('dashboard.noGradesHint')}
                  className="py-8"
                />
              ) : (
                <ul>
                  {recentGrades.map((g) => (
                    <li key={g.id} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{g.student_name}</p>
                        <p className="truncate text-xs text-ink-mute">
                          {g.homework_title ?? t('grades.general')} · {fromNow(g.created_at)}
                        </p>
                      </div>
                      <ScoreBadge score={g.score} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {groups.data && groups.data.length > 0 && (
        <p className="mt-6 text-sm text-ink-mute">
          <Badge variant="outline" className="mr-2">
            {t('dashboard.tip')}
          </Badge>
          {t('dashboard.tipText')}
        </p>
      )}
    </>
  )
}
