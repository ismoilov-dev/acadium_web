import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Landing-style KPI trio: Kelgan / Kechikkan / Kelmagan. */
export function AttendanceKpis({
  present,
  late,
  absent,
  loading,
  className,
}: {
  present: number
  late: number
  absent: number
  loading?: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const items = [
    { label: t('attendance.present'), value: present, tone: 'text-ok', bar: 'bg-ok' },
    { label: t('attendance.late'), value: late, tone: 'text-warn', bar: 'bg-warn' },
    { label: t('attendance.absent'), value: absent, tone: 'text-bad', bar: 'bg-bad' },
  ]
  return (
    <div className={cn('grid grid-cols-3 gap-2.5', className)}>
      {items.map((k) => (
        <div key={k.label} className="relative overflow-hidden rounded-lg border bg-card p-3">
          <span className={cn('absolute inset-x-0 top-0 h-0.5 opacity-70', k.bar)} />
          <small className="block text-[.74rem] font-semibold text-ink-mute">{k.label}</small>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-10" />
          ) : (
            <strong className={cn('tabular text-[1.45rem] font-extrabold', k.value > 0 && k.tone)}>
              {k.value}
            </strong>
          )}
        </div>
      ))}
    </div>
  )
}
