import { ClipboardCheck, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DataTable, type Column } from '@/components/shared/DataTable'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/States'
import { AttendanceBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardBar } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useVisibleGroups } from '@/hooks/useGroups'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useTeachers'
import { buildDay } from '@/lib/attendance'
import { fmtTime, now, tz } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { AttendanceRecord, AttendanceStatus } from '@/types'

import { AttendanceKpis } from './AttendanceKpis'

type StatusFilter = 'ALL' | AttendanceStatus

export default function AttendancePage() {
  const { t } = useTranslation()
  const [date, setDate] = useState(now().format('YYYY-MM-DD'))
  const [groupId, setGroupId] = useState<string>()
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const att = useAttendance({ date })
  const groups = useVisibleGroups()
  const students = useStudents()

  const day = useMemo(
    () => buildDay(att.data, date, groups.data ?? [], students.data ?? []),
    [att.data, date, groups.data, students.data],
  )

  const studentMap = useMemo(
    () => new Map((students.data ?? []).map((s) => [s.id, s])),
    [students.data],
  )
  const groupMap = useMemo(() => new Map((groups.data ?? []).map((g) => [g.id, g])), [groups.data])

  const rows = useMemo(() => {
    return day.records
      .map((r) => {
        const st = r.student_id ? studentMap.get(r.student_id) : undefined
        const gid = r.group_id ?? st?.group_id
        return {
          ...r,
          student_name:
            r.student_name ?? (st ? `${st.first_name} ${st.last_name ?? ''}`.trim() : undefined),
          group_id: gid,
          group_name: r.group_name ?? (gid ? groupMap.get(gid)?.name : undefined),
        }
      })
      .filter((r) => !groupId || r.group_id === groupId)
      .filter((r) => status === 'ALL' || r.status === status)
  }, [day.records, studentMap, groupMap, groupId, status])

  const columns: Column<AttendanceRecord>[] = [
    {
      id: 'student',
      header: t('attendance.student'),
      cell: (r) => <span className="font-bold">{r.student_name ?? '—'}</span>,
      sortValue: (r) => r.student_name ?? '',
    },
    {
      id: 'group',
      header: t('fields.group'),
      cell: (r) => (r.group_name ? <Badge>{r.group_name}</Badge> : '—'),
      sortValue: (r) => r.group_name ?? '',
    },
    {
      id: 'time',
      header: t('attendance.checkIn'),
      cell: (r) => (
        <span className="tabular font-semibold">
          {r.check_in_at ? fmtTime(r.check_in_at) : '—'}
        </span>
      ),
      sortValue: (r) => r.check_in_at ?? '',
    },
    {
      id: 'status',
      header: t('fields.status'),
      cell: (r) => <AttendanceBadge status={r.status} />,
    },
  ]

  const isToday = date === now().format('YYYY-MM-DD')

  return (
    <>
      <PageHeader
        title={t('nav.attendance')}
        description={t('attendance.subtitle')}
        actions={
          <Input
            type="date"
            value={date}
            max={now().format('YYYY-MM-DD')}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-auto"
          />
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="overflow-hidden">
          <CardBar title={isToday ? t('attendance.today') : tz(date).format('DD.MM.YYYY')} />
          <div className="p-[18px]">
            <AttendanceKpis
              present={day.present}
              late={day.late}
              absent={day.absent}
              loading={att.isLoading}
            />
            {day.derivedAbsent && (
              <p className="mt-3 text-xs text-ink-mute">
                {t('attendance.derivedHint', { expected: day.expected })}
              </p>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardBar title={t('attendance.byGroup')} />
          {day.byGroup.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title={t('attendance.noLessons')} className="py-8" />
          ) : (
            <ul className="grid gap-2 p-[18px] sm:grid-cols-2">
              {day.byGroup.map((g) => {
                const came = g.present + g.late
                const full = g.expected > 0 && came >= g.expected
                return (
                  <li key={g.group.id}>
                    <button
                      type="button"
                      onClick={() => setGroupId(groupId === g.group.id ? undefined : g.group.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[.9rem] transition-colors hover:bg-soft',
                        groupId === g.group.id && 'border-primary bg-tint',
                      )}
                    >
                      <span className="grid size-7 place-items-center rounded-sm bg-tint text-[.68rem] font-bold text-tint-foreground">
                        {g.group.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{g.group.name}</span>
                      <Badge variant={full ? 'ok' : came === 0 ? 'muted' : 'warn'}>
                        {came}/{g.expected}
                      </Badge>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id || `${r.student_id}-${r.check_in_at}`}
        loading={att.isLoading}
        error={att.error}
        onRetry={() => void att.refetch()}
        searchText={(r) => `${r.student_name ?? ''} ${r.group_name ?? ''}`}
        initialSort={{ id: 'time' }}
        pageSize={20}
        toolbar={
          <>
            <div className="w-full sm:w-56">
              <GroupSelect
                value={groupId}
                onChange={setGroupId}
                allowNone
                noneLabel={t('groups.allGroups')}
              />
            </div>
            <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <TabsList>
                <TabsTrigger value="ALL">{t('common.all')}</TabsTrigger>
                <TabsTrigger value="PRESENT">{t('attendance.present')}</TabsTrigger>
                <TabsTrigger value="LATE">{t('attendance.late')}</TabsTrigger>
                <TabsTrigger value="ABSENT">{t('attendance.absent')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
        empty={
          <EmptyState
            icon={ClipboardCheck}
            title={t('attendance.empty')}
            description={t('attendance.emptyHint')}
          />
        }
      />
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" /> {t('attendance.readOnly')}
      </p>
    </>
  )
}
