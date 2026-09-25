import { api } from './client'
import { listOf, parseGroup } from './parsers'

export interface GroupInput {
  name: string
  description?: string
  days_of_week: number[]
  start_time: string
  end_time: string
  online_url?: string
}

export const groupsApi = {
  list: async () => listOf(parseGroup)(await api.get<unknown>('/groups')),
  get: async (id: string) => parseGroup(await api.get<unknown>(`/groups/${id}`)),
  create: async (body: GroupInput) => parseGroup(await api.post<unknown>('/groups', body)),
  update: async (id: string, body: Partial<GroupInput>) =>
    parseGroup(await api.patch<unknown>(`/groups/${id}`, body)),
  remove: (id: string) => api.delete<unknown>(`/groups/${id}`),
  /** Teacher / admin: groups visible to the caller. */
  mine: async () => listOf(parseGroup)(await api.get<unknown>('/teacher/groups')),
}
