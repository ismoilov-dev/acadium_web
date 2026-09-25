import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  to,
  loading,
  tone = 'default',
}: {
  label: ReactNode
  value: ReactNode
  icon: LucideIcon
  hint?: ReactNode
  to?: string
  loading?: boolean
  tone?: 'default' | 'ok' | 'warn' | 'bad'
}) {
  const body = (
    <div
      className={cn(
        'group flex h-full items-start gap-4 rounded-xl border bg-card p-5 transition-all duration-200',
        to && 'hover:-translate-y-1 hover:shadow-lift',
      )}
    >
      <span
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-[14px] transition-colors duration-200',
          tone === 'default' &&
            'bg-tint text-tint-foreground group-hover:bg-brand group-hover:text-white',
          tone === 'ok' && 'bg-ok-soft text-ok',
          tone === 'warn' && 'bg-warn-soft text-warn',
          tone === 'bad' && 'bg-bad-soft text-bad',
        )}
      >
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[.8rem] font-semibold text-ink-mute">{label}</p>
        {loading ? (
          <Skeleton className="mt-1.5 h-7 w-16" />
        ) : (
          <p className="tabular text-[1.6rem] font-extrabold leading-tight">{value}</p>
        )}
        {hint && <p className="mt-0.5 truncate text-xs text-ink-soft">{hint}</p>}
      </div>
    </div>
  )
  return to ? (
    <Link to={to} className="block rounded-xl">
      {body}
    </Link>
  ) : (
    body
  )
}
