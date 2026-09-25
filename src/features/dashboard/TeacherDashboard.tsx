import { BookOpenCheck, CalendarClock, Clock, Star, Users, Video } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthProvider'
import { HomeworkStateBadge } from '@/features/homework/HomeworkStateBadge'
import { useVisibleGroups } from '@/hooks/useGroups'
import { useHomeworkList } from '@/hooks/useHomework'
import { useTeacherDashboard } from '@/hooks/useTeachers'
import { fmtTime, fromNow, now, todayWeekday } from '@/lib/date'
import { homeworkState } from '@/lib/homework'
import { cn } from '@/lib/utils'

import { TodayAttendanceCard } from './TodayAttendanceCard'

export default function TeacherDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const dash = useTeacherDashboard()
  const groupsQ = useVisibleGroups()
  const hwQ = useHomeworkList()

  const groups = useMemo(
    () => (dash.data?.groups.length ? dash.data.groups : (groupsQ.data ?? [])),
    [dash.data, groupsQ.data],
  )
  const myGroupIds = useMemo(() => new Set(groups.map((g) => g.id)), [groups])
  const groupName = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups])

  const wd = todayWeekday()
  const nowMin = now().hour() * 60 + now().minute()
  const lessons = groups
    .filter((g) => g.days_of_week.includes(wd))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const homework = (dash.data?.homework.length ? dash.data.homework : (hwQ.data ?? [])).filter(
    (h) => !myGroupIds.size || myGroupIds.has(h.group_id),
  )
  const upcoming = homework
    .filter((h) => ['soon', 'active'].includes(homeworkState(h)))
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
    .slice(0, 6)

  const toMin = (v: string) => {
    const [h, m] = fmtTime(v).split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }

  return (
    <>
      <PageHeader
        title={t('dashboard.hello', { name: user?.first_name ?? '' })}
        description={t('dashboard.teacherSubtitle', { count: lessons.length })}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/grades">
                <Star /> {t('grades.open')}
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

      {dash.error && !groupsQ.data && (
        <Card className="mb-6">
          <ErrorState error={dash.error} onRetry={() => void dash.refetch()} />
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t('nav.myGroups')}
          value={groups.length}
          icon={Users}
          to="/groups"
          loading={dash.isLoading && groupsQ.isLoading}
        />
        <StatCard
          label={t('dashboard.lessonsToday')}
          value={lessons.length}
          icon={CalendarClock}
          to="/schedule"
          loading={dash.isLoading && groupsQ.isLoading}
        />
        <StatCard
          label={t('dashboard.activeHomework')}
          value={upcoming.length}
          icon={BookOpenCheck}
          to="/homework"
          loading={hwQ.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.todayLessons')}</CardTitle>
              <Badge variant="muted">{t(`weekdays.long.${wd}`)}</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {dash.isLoading && groupsQ.isLoading ? (
                <ListSkeleton rows={3} />
              ) : lessons.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title={t('dashboard.noLessons')}
                  className="py-8"
                />
              ) : (
                <ul>
                  {lessons.map((g) => {
                    const live = nowMin >= toMin(g.start_time) && nowMin <= toMin(g.end_time)
                    const done = nowMin > toMin(g.end_time)
                    return (
                      <li
                        key={g.id}
                        className={cn('flex items-center gap-3 px-5 py-3', live && 'bg-tint/50')}
                      >
                        <div className={cn('w-16 shrink-0 text-center', done && 'opacity-50')}>
                          <p className="tabular font-extrabold">{fmtTime(g.start_time)}</p>
                          <p className="tabular text-xs text-ink-mute">{fmtTime(g.end_time)}</p>
                        </div>
                        <Link
                          to={`/groups/${g.id}`}
                          className={cn('min-w-0 flex-1 hover:opacity-80', done && 'opacity-50')}
                        >
                          <p className="truncate font-bold">{g.name}</p>
                          <p className="flex items-center gap-1 text-xs text-ink-soft">
                            <Clock className="size-3" />
                            {live
                              ? t('dashboard.liveNow')
                              : done
                                ? t('dashboard.finished')
                                : t('dashboard.upcoming')}
                          </p>
                        </Link>
                        {g.online_url && (
                          <Button size="sm" variant={live ? 'default' : 'outline'} asChild>
                            <a href={g.online_url} target="_blank" rel="noreferrer">
                              <Video /> {t('dashboard.join')}
                            </a>
                          </Button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.deadlines')}</CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/homework">{t('common.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {hwQ.isLoading ? (
                <ListSkeleton rows={3} />
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon={BookOpenCheck}
                  title={t('dashboard.noDeadlines')}
                  className="py-8"
                />
              ) : (
                <ul>
                  {upcoming.map((h) => (
                    <li key={h.id}>
                      <Link
                        to={`/homework/${h.id}`}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-soft"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{h.title}</p>
                          <p className="truncate text-xs text-ink-mute">
                            {h.group_name ?? groupName.get(h.group_id) ?? '—'} ·{' '}
                            {fromNow(h.deadline)}
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
        </div>

        <TodayAttendanceCard />
      </div>
    </>
  )
}
