import { api } from './client'
import { listOf, parseAttendance, parseTeacher, parseTeacherDashboard } from './parsers'

export interface TeacherPatch {
  first_name?: string
  last_name?: string
  specialization?: string
  avatar_url?: string
}

export const teachersApi = {
  list: async () => listOf(parseTeacher)(await api.get<unknown>('/teachers')),
  get: async (id: string) => parseTeacher(await api.get<unknown>(`/teachers/${id}`)),
  update: async (id: string, body: TeacherPatch) =>
    parseTeacher(await api.patch<unknown>(`/teachers/${id}`, body)),
  dashboard: async () => parseTeacherDashboard(await api.get<unknown>('/teacher/dashboard')),
  /** Center-wide attendance (teacher / admin). */
  attendance: async (params?: { date?: string; group_id?: string }) =>
    parseAttendance(await api.get<unknown>('/teacher/attendance', { params })),
}
