import { api } from './client'
import { listOf, parseHomework } from './parsers'

export interface HomeworkInput {
  group_id: string
  title: string
  description?: string
  deadline?: string
  file_url?: string
}

export const homeworkApi = {
  /** `group_id` is sent as a hint; results are always filtered client-side too. */
  list: async (groupId?: string) => {
    const items = listOf(parseHomework)(
      await api.get<unknown>('/homework', { params: groupId ? { group_id: groupId } : undefined }),
    )
    return groupId ? items.filter((h) => h.group_id === groupId) : items
  },
  get: async (id: string) => parseHomework(await api.get<unknown>(`/homework/${id}`)),
  create: async (body: HomeworkInput) => parseHomework(await api.post<unknown>('/homework', body)),
  update: async (id: string, body: Partial<HomeworkInput>) =>
    parseHomework(await api.patch<unknown>(`/homework/${id}`, body)),
  remove: (id: string) => api.delete<unknown>(`/homework/${id}`),
}
