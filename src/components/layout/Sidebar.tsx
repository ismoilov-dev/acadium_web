import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/lib/utils'

import { Logo } from './Logo'
import { navFor } from './nav'

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const sections = navFor(user?.role)

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={t('nav.aria')}>
      {sections.map((section, i) => (
        <div key={i} className={cn(i > 0 && 'mt-5')}>
          {section.label &&
            (collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-border" />
            ) : (
              <p className="mb-1.5 px-3 text-[.7rem] font-bold uppercase tracking-wider text-ink-mute">
                {t(section.label)}
              </p>
            ))}
          <ul className="grid gap-0.5">
            {section.items.map((item) => {
              const link = (
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex h-10 items-center gap-3 rounded-md px-3 text-[.92rem] font-semibold text-ink-soft transition-colors hover:bg-soft hover:text-foreground',
                      collapsed && 'justify-center px-0',
                      isActive && 'bg-tint text-foreground hover:bg-tint',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-[8px] transition-colors',
                          isActive
                            ? 'bg-brand text-white'
                            : 'text-ink-mute group-hover:text-tint-foreground',
                        )}
                      >
                        <item.icon className="size-[18px]" strokeWidth={1.9} />
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{t(item.label)}</span>}
                      {!collapsed && item.soon && (
                        <span className="rounded-full bg-warn-soft px-1.5 py-0.5 text-[.62rem] font-bold text-warn">
                          {t('common.soon')}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
              return (
                <li key={item.label}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{t(item.label)}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useTranslation()
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-[260px]',
      )}
    >
      <div className={cn('flex h-[68px] items-center px-5', collapsed && 'justify-center px-0')}>
        <NavLink to="/dashboard" aria-label="Acadium">
          <Logo collapsed={collapsed} />
        </NavLink>
      </div>
      <SidebarNav collapsed={collapsed} />
      <div className="border-t p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold text-ink-mute transition-colors hover:bg-soft hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && t('nav.collapse')}
        </button>
      </div>
    </aside>
  )
}
