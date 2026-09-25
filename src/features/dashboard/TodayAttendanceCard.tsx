import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ErrorState } from '@/components/shared/States'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBar } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceKpis } from '@/features/attendance/AttendanceKpis'
import { useVisibleGroups } from '@/hooks/useGroups'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useTeachers'
import { buildDay } from '@/lib/attendance'
import { fmtTime, now } from '@/lib/date'

import { AttendanceChart } from './AttendanceChart'

/** The landing page's "Bugungi davomat" card, with live data. */
export function TodayAttendanceCard() {
  const { t } = useTranslation()
  const att = useAttendance()
  const groups = useVisibleGroups()
  const students = useStudents()
  const today = now().format('YYYY-MM-DD')
  const day = useMemo(
    () => buildDay(att.data, today, groups.data ?? [], students.data ?? []),
    [att.data, today, groups.data, students.data],
  )
  const loading = att.isLoading || groups.isLoading

  return (
    <Card className="overflow-hidden shadow-card">
      <CardBar
        title={t('attendance.today')}
        action={
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
            <Link to="/attendance">
              {t('common.details')} <ArrowRight className="!size-3.5" />
            </Link>
          </Button>
        }
      />
      {att.error ? (
        <ErrorState error={att.error} onRetry={() => void att.refetch()} />
      ) : (
        <div className="grid gap-4 p-[18px]">
          <AttendanceKpis
            present={day.present}
            late={day.late}
            absent={day.absent}
            loading={loading}
          />
          <AttendanceChart records={att.data?.records ?? []} />
          <div className="grid gap-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)
            ) : day.byGroup.length === 0 ? (
              <p className="py-2 text-center text-sm text-ink-mute">{t('attendance.noLessons')}</p>
            ) : (
              [...day.byGroup]
                .sort((a, b) => a.group.start_time.localeCompare(b.group.start_time))
                .map((g) => {
                  const came = g.present + g.late
                  const full = g.expected > 0 && came >= g.expected
                  return (
                    <Link
                      key={g.group.id}
                      to={`/groups/${g.group.id}`}
                      className="-mx-1 flex items-center gap-2.5 rounded-md px-1 py-0.5 text-[.85rem] hover:bg-soft"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-tint text-[.68rem] font-bold text-tint-foreground">
                        {g.group.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{g.group.name}</span>
                      <span className="tabular text-xs font-semibold text-ink-mute">
                        {fmtTime(g.group.start_time)}
                      </span>
                      <Badge variant={full ? 'ok' : came === 0 ? 'muted' : 'warn'}>
                        {came}/{g.expected}
                      </Badge>
                    </Link>
                  )
                })
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
