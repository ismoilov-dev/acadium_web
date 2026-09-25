import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const

/** ISO weekday chips: 1 = Monday … 7 = Sunday (Du Se Ch Pa Ju Sh Ya). */
export function WeekdayPicker({
  value,
  onChange,
  invalid,
}: {
  value: number[]
  onChange: (days: number[]) => void
  invalid?: boolean
}) {
  const { t } = useTranslation()
  const toggle = (d: number) =>
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b))
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-invalid={invalid}>
      {WEEKDAYS.map((d) => {
        const on = value.includes(d)
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            title={t(`weekdays.long.${d}`)}
            onClick={() => toggle(d)}
            className={cn(
              'h-10 min-w-11 rounded-md border px-2 text-sm font-bold transition-all',
              on
                ? 'border-transparent bg-brand text-white shadow-btn'
                : 'bg-card text-ink-soft hover:border-primary hover:text-foreground',
              invalid && !on && 'border-bad/60',
            )}
          >
            {t(`weekdays.short.${d}`)}
          </button>
        )
      })}
    </div>
  )
}

export function WeekdayList({ days, className }: { days?: number[] | null; className?: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex flex-wrap gap-1', className)}>
      {WEEKDAYS.map((d) => (
        <span
          key={d}
          className={cn(
            'grid h-6 min-w-7 place-items-center rounded-md px-1 text-[.7rem] font-bold',
            days?.includes(d) ? 'bg-tint text-tint-foreground' : 'bg-soft text-ink-mute/70',
          )}
        >
          {t(`weekdays.short.${d}`)}
        </span>
      ))}
    </span>
  )
}
