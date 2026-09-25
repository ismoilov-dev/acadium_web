import { api } from './client'
import { listOf, parseNotification } from './parsers'

export const notificationsApi = {
  list: async () => listOf(parseNotification)(await api.get<unknown>('/notifications')),
  markRead: (id: string) => api.patch<unknown>(`/notifications/${id}/read`),
  markAllRead: () => api.post<unknown>('/notifications/read-all'),
}
