import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-[9px] bg-brand text-white',
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-[18px]">
        <path
          d="M16 4 4 28h5.5l2.4-5.2h8.2L22.5 28H28L16 4Zm-2.2 14.6L16 13.7l2.2 4.9h-4.4Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

export function Logo({
  collapsed = false,
  className,
}: {
  collapsed?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight',
        className,
      )}
    >
      <LogoMark />
      {!collapsed && <span>Acadium</span>}
    </span>
  )
}
