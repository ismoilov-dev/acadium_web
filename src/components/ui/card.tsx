import * as React from 'react'

import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-card text-card-foreground', className)}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center justify-between gap-3 p-5 pb-3', className)}
      {...props}
    />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-bold leading-tight', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-ink-soft', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

/** Landing-style window bar: three dots + title (the "Admin paneli" mock). */
function CardBar({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-t-xl border-b bg-soft px-4 py-3">
      <span className="size-2.5 rounded-full bg-[#dfe3ec] dark:bg-border" />
      <span className="size-2.5 rounded-full bg-[#dfe3ec] dark:bg-border" />
      <span className="size-2.5 rounded-full bg-[#dfe3ec] dark:bg-border" />
      <span className="ml-2.5 text-[.82rem] font-semibold text-ink-soft">{title}</span>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  )
}

export { Card, CardBar, CardContent, CardDescription, CardHeader, CardTitle }
