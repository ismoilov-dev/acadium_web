import { api } from './client'
import { listOf, parseStudent } from './parsers'

export interface StudentPatch {
  first_name?: string
  last_name?: string
}

export const studentsApi = {
  list: async () => listOf(parseStudent)(await api.get<unknown>('/students')),
  get: async (id: string) => parseStudent(await api.get<unknown>(`/students/${id}`)),
  update: async (id: string, body: StudentPatch) =>
    parseStudent(await api.patch<unknown>(`/students/${id}`, body)),
  moveToGroup: (id: string, groupId: string) =>
    api.patch<unknown>(`/students/${id}/group`, { group_id: groupId }),
}
