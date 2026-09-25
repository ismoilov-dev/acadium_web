import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { notificationsApi } from '@/api/notifications'
import { parseNotification } from '@/api/parsers'
import { WS_BASE_URL } from '@/lib/env'
import { tokenStore } from '@/lib/storage'
import { ReconnectingSocket, type WsStatus } from '@/lib/ws'
import type { AppNotification } from '@/types'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useNotificationsList = () =>
  useQuery({
    queryKey: qk.notifications,
    queryFn: notificationsApi.list,
    refetchInterval: 5 * 60_000,
  })

/** Opens the notification socket once per session and pushes new items into the query cache. */
export function useNotificationsSocket(enabled: boolean): WsStatus {
  const qc = useQueryClient()
  const [status, setStatus] = useState<WsStatus>('closed')

  useEffect(() => {
    if (!enabled) return
    const sock = new ReconnectingSocket<unknown>({
      url: () => {
        const token = tokenStore.get()
        return token
          ? `${WS_BASE_URL}/api/v1/ws/notifications?token=${encodeURIComponent(token)}`
          : null
      },
      onStatus: setStatus,
      onMessage: (data) => {
        const n = parseNotification(data)
        if (!n.id && !n.title) return
        qc.setQueryData<AppNotification[]>(qk.notifications, (prev = []) =>
          prev.some((p) => p.id === n.id) ? prev : [{ ...n, is_read: false }, ...prev],
        )
        toast(n.title, { description: n.body })
        // A new grade/homework notification usually means lists changed too.
        const type = (n.type ?? '').toUpperCase()
        if (type.includes('HOMEWORK')) void qc.invalidateQueries({ queryKey: ['homework'] })
        if (type.includes('GRADE')) void qc.invalidateQueries({ queryKey: qk.students })
        if (type.includes('ATTENDANCE') || type.includes('CHECK'))
          void qc.invalidateQueries({ queryKey: ['attendance'] })
        if (type.includes('DEVICE') || type.includes('LOGIN'))
          void qc.invalidateQueries({ queryKey: qk.deviceRequests })
      },
    })
    sock.start()
    return () => sock.stop()
  }, [enabled, qc])

  return status
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useApiMutation({
    mutationFn: async (id: string) => {
      qc.setQueryData<AppNotification[]>(qk.notifications, (prev = []) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      )
      return notificationsApi.markRead(id)
    },
    silentError: true,
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useApiMutation({
    mutationFn: async () => {
      qc.setQueryData<AppNotification[]>(qk.notifications, (prev = []) =>
        prev.map((n) => ({ ...n, is_read: true })),
      )
      return notificationsApi.markAllRead()
    },
    invalidate: [qk.notifications],
  })
}
