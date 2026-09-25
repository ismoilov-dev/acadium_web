import { api } from './client'
import { listOf, parseDebate } from './parsers'

export interface DebateInput {
  group_id: string
  title: string
  topic: string
  starts_at?: string
  ends_at?: string
}

export const arenaApi = {
  list: async () => listOf(parseDebate)(await api.get<unknown>('/arena/debates')),
  get: async (id: string) => parseDebate(await api.get<unknown>(`/arena/debates/${id}`)),
  create: async (body: DebateInput) => parseDebate(await api.post<unknown>('/arena/debates', body)),
}
