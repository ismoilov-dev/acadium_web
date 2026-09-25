import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { recordDay } from '@/lib/attendance'
import { now } from '@/lib/date'
import type { AttendanceRecord } from '@/types'

interface Point {
  day: string
  label: string
  attended: number
  present: number
  late: number
  absent: number
}

/** Last 7 days of check-ins, one brand-gradient series (matches the landing's dashboard mock). */
export function AttendanceChart({ records }: { records: AttendanceRecord[] }) {
  const { t } = useTranslation()
  const data = useMemo<Point[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = now().subtract(6 - i, 'day')
      const key = d.format('YYYY-MM-DD')
      const recs = records.filter((r) => recordDay(r) === key)
      const present = recs.filter((r) => r.status === 'PRESENT').length
      const late = recs.filter((r) => r.status === 'LATE').length
      const absent = recs.filter((r) => r.status === 'ABSENT').length
      return {
        day: key,
        label: t(`weekdays.short.${d.isoWeekday()}`),
        attended: present + late,
        present,
        late,
        absent,
      }
    })
  }, [records, t])

  const hasData = data.some((d) => d.attended > 0)

  return (
    <div className="relative h-36 rounded-lg bg-soft px-2 pt-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="brandBar" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a9eed" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeWidth={1} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--ink-mute))' }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: 'hsl(var(--ink-mute))' }}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--border))', opacity: 0.5 }}
            content={(p) => <ChartTip active={p.active} payload={p.payload} />}
          />
          <Bar
            dataKey="attended"
            fill="url(#brandBar)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            opacity={0.9}
          />
        </BarChart>
      </ResponsiveContainer>
      {!hasData && (
        <p className="absolute inset-0 grid place-items-center text-sm font-semibold text-ink-mute">
          {t('dashboard.noChartData')}
        </p>
      )}
    </div>
  )
}

function ChartTip({
  active,
  payload,
}: Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'payload'>) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Point
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lift">
      <p className="tabular mb-1 font-bold">{p.day.split('-').reverse().join('.')}</p>
      <p className="flex justify-between gap-4">
        <span className="text-ink-soft">{t('attendance.present')}</span>{' '}
        <b className="tabular">{p.present}</b>
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-ink-soft">{t('attendance.late')}</span>{' '}
        <b className="tabular">{p.late}</b>
      </p>
      {p.absent > 0 && (
        <p className="flex justify-between gap-4">
          <span className="text-ink-soft">{t('attendance.absent')}</span>{' '}
          <b className="tabular">{p.absent}</b>
        </p>
      )}
    </div>
  )
}
