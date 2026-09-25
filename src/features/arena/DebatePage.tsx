import {
  ArrowLeft,
  CalendarClock,
  SendHorizontal,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBar } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useDebate } from '@/hooks/useArena'
import { useVisibleGroups } from '@/hooks/useGroups'
import { fmtDateTime, fmtTime } from '@/lib/date'
import { WS_BASE_URL } from '@/lib/env'
import { rec, str } from '@/lib/normalize'
import { tokenStore } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { ReconnectingSocket, type WsStatus } from '@/lib/ws'
import type { ArenaMessage } from '@/types'

import { PhaseBadge } from './phase'

function parseMessage(v: unknown): ArenaMessage | null {
  const o = rec(v)
  const content = str(o, ['content', 'message', 'text'], [])
  if (!content) return null
  return {
    type: str(o, 'type', []) ?? 'MESSAGE',
    sender_id: str(o, 'sender_id', []),
    sender_name: str(o, 'sender_name', []),
    content,
    timestamp: str(o, ['timestamp', 'created_at'], []),
  }
}

export default function DebatePage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const q = useDebate(id)
  const groups = useVisibleGroups()
  const debate = q.data
  const [messages, setMessages] = useState<ArenaMessage[]>([])
  const [status, setStatus] = useState<WsStatus>('connecting')
  const [text, setText] = useState('')
  const socketRef = useRef<ReconnectingSocket<unknown> | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    const sock = new ReconnectingSocket<unknown>({
      url: () => {
        const token = tokenStore.get()
        return token
          ? `${WS_BASE_URL}/api/v1/ws/arena/${id}?token=${encodeURIComponent(token)}`
          : null
      },
      onStatus: setStatus,
      onMessage: (data) => {
        const m = parseMessage(data)
        if (m) setMessages((prev) => [...prev.slice(-499), m])
      },
    })
    socketRef.current = sock
    sock.start()
    return () => sock.stop()
  }, [id])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const participants = useMemo(
    () => new Set(messages.map((m) => m.sender_id ?? m.sender_name)).size,
    [messages],
  )

  const send = (e: FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    if (socketRef.current?.send({ type: 'MESSAGE', content })) setText('')
  }

  const back = (
    <Link
      to="/arena"
      className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> {t('nav.arena')}
    </Link>
  )

  if (!debate) {
    return (
      <>
        <PageHeader title={t('nav.arena')} back={back} />
        <Card>
          {q.isLoading ? (
            <ListSkeleton />
          ) : (
            <ErrorState error={q.error} onRetry={() => void q.refetch()} />
          )}
        </Card>
      </>
    )
  }

  const groupName = debate.group_name ?? groups.data?.find((g) => g.id === debate.group_id)?.name

  return (
    <>
      <PageHeader
        back={back}
        title={debate.title}
        description={debate.topic}
        actions={<PhaseBadge debate={debate} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="flex h-[min(640px,calc(100dvh-260px))] min-h-[420px] flex-col overflow-hidden">
          <CardBar
            title={t('arena.chat')}
            action={
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-bold',
                  status === 'open'
                    ? 'text-ok'
                    : status === 'connecting'
                      ? 'text-warn'
                      : 'text-bad',
                )}
              >
                {status === 'open' ? (
                  <Wifi className="size-3.5" />
                ) : (
                  <WifiOff className="size-3.5" />
                )}
                {t(`arena.ws.${status}`)}
              </span>
            }
          />
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.length === 0 ? (
              <EmptyState
                title={t('arena.noMessages')}
                description={t('arena.noMessagesHint')}
                className="h-full"
              />
            ) : (
              messages.map((m, i) => {
                const mine = !!user && m.sender_id === user.id
                const system = m.type !== 'MESSAGE'
                if (system)
                  return (
                    <p key={i} className="text-center text-xs font-semibold text-ink-mute">
                      {m.content}
                    </p>
                  )
                return (
                  <div key={i} className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
                    <Avatar className="size-7">
                      <AvatarFallback className={cn(mine && 'bg-brand text-white')}>
                        {(m.sender_name ?? '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-3.5 py-2',
                        mine ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-soft',
                      )}
                    >
                      {!mine && (
                        <p className="text-xs font-bold text-tint-foreground">
                          {m.sender_name ?? t('arena.participant')}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                      <p
                        className={cn(
                          'tabular mt-0.5 text-right text-[.65rem]',
                          mine ? 'text-white/75' : 'text-ink-mute',
                        )}
                      >
                        {fmtTime(m.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('arena.messagePlaceholder')}
              maxLength={1000}
              disabled={status !== 'open'}
            />
            <Button
              type="submit"
              size="icon"
              disabled={status !== 'open' || !text.trim()}
              aria-label={t('arena.send')}
            >
              <SendHorizontal />
            </Button>
          </form>
        </Card>

        <Card className="h-fit p-5">
          <p className="flex items-center gap-2 font-bold">
            <ShieldCheck className="size-4 text-primary" /> {t('arena.moderator')}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{t('arena.moderatorHint')}</p>
          <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                <Users className="size-4" /> {t('fields.group')}
              </dt>
              <dd>{groupName ? <Badge>{groupName}</Badge> : '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                <CalendarClock className="size-4" /> {t('arena.startsAt')}
              </dt>
              <dd className="tabular font-semibold">{fmtDateTime(debate.starts_at)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="inline-flex items-center gap-1.5 text-ink-soft">
                <CalendarClock className="size-4" /> {t('arena.endsAt')}
              </dt>
              <dd className="tabular font-semibold">{fmtDateTime(debate.ends_at)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-soft">{t('arena.activeInChat')}</dt>
              <dd className="tabular font-extrabold">
                {debate.participants_count ?? participants}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}
