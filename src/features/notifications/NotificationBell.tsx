import {
  Bell,
  BookOpenCheck,
  CheckCheck,
  ClipboardCheck,
  MonitorSmartphone,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  useMarkAllRead,
  useMarkRead,
  useNotificationsList,
  useNotificationsSocket,
} from '@/hooks/useNotifications'
import { fromNow } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types'

function iconFor(type?: string) {
  const s = (type ?? '').toUpperCase()
  if (s.includes('GRADE')) return { Icon: Star, tone: 'from-[#b69cff] to-[#8b5cf6]' }
  if (s.includes('HOMEWORK')) return { Icon: BookOpenCheck, tone: 'from-[#7cc0ff] to-[#4a9eed]' }
  if (s.includes('ATTEND') || s.includes('CHECK'))
    return { Icon: ClipboardCheck, tone: 'from-[#34d399] to-[#16a34a]' }
  if (s.includes('DEVICE') || s.includes('LOGIN'))
    return { Icon: MonitorSmartphone, tone: 'from-[#fbbf24] to-[#d97706]' }
  return { Icon: Bell, tone: 'from-[#7cc0ff] to-[#8b5cf6]' }
}

function linkFor(n: AppNotification): string | undefined {
  const s = (n.type ?? '').toUpperCase()
  if (s.includes('DEVICE') || s.includes('LOGIN')) return '/profile?tab=devices'
  if (s.includes('HOMEWORK')) return '/homework'
  if (s.includes('GRADE')) return '/grades'
  if (s.includes('ATTEND')) return '/attendance'
  return undefined
}

export function NotificationBell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const list = useNotificationsList()
  const status = useNotificationsSocket(true)
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const items = list.data ?? []
  const unread = items.filter((n) => !n.is_read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={t('notifications.title')}
        >
          <Bell />
          {unread > 0 && (
            <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[.65rem] font-extrabold text-white ring-2 ring-card">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <span
            className={cn(
              'absolute bottom-1 right-1 size-1.5 rounded-full',
              status === 'open' ? 'bg-ok' : status === 'connecting' ? 'bg-warn' : 'bg-ink-mute',
            )}
            title={t(`notifications.ws.${status}`)}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <p className="font-bold">
            {t('notifications.title')}{' '}
            {unread > 0 && <span className="text-ink-mute">({unread})</span>}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread}
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {!markAll.isPending && <CheckCheck />} {t('notifications.readAll')}
          </Button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {list.isLoading ? (
            <ListSkeleton rows={4} />
          ) : list.error ? (
            <ErrorState error={list.error} onRetry={() => void list.refetch()} className="py-8" />
          ) : items.length === 0 ? (
            <EmptyState icon={Bell} title={t('notifications.empty')} className="py-10" />
          ) : (
            <ul className="divide-y">
              {items.slice(0, 50).map((n) => {
                const { Icon, tone } = iconFor(n.type)
                const to = linkFor(n)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.is_read) markRead.mutate(n.id)
                        if (to) {
                          setOpen(false)
                          navigate(to)
                        }
                      }}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-soft',
                        !n.is_read && 'bg-tint/50',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white',
                          tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold leading-snug">{n.title}</span>
                        {n.body && (
                          <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-1 block text-[.7rem] text-ink-mute">
                          {fromNow(n.created_at)}
                        </span>
                      </span>
                      {!n.is_read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
