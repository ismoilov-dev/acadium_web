import { api } from './client'
import { listOf, parseCenter, parseMember, parseStudent, parseTeacher } from './parsers'

export interface CenterInput {
  name?: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  attendance_radius_meters?: number
  logo_url?: string
}

export interface AddStudentInput {
  phone: string
  first_name: string
  last_name?: string
  group_id?: string
}

export interface AddTeacherInput {
  phone: string
  first_name: string
  last_name?: string
  specialization?: string
}

export interface AddParentInput {
  phone: string
  first_name: string
  last_name?: string
  student_ids?: string[]
}

export const centersApi = {
  me: async () => parseCenter(await api.get<unknown>('/centers/me')),
  update: async (body: CenterInput) => parseCenter(await api.patch<unknown>('/centers/me', body)),
  members: async () => listOf(parseMember)(await api.get<unknown>('/centers/me/members')),
  addStudent: async (body: AddStudentInput) =>
    parseStudent(await api.post<unknown>('/centers/me/students', body)),
  addTeacher: async (body: AddTeacherInput) =>
    parseTeacher(await api.post<unknown>('/centers/me/teachers', body)),
  addParent: (body: AddParentInput) => api.post<unknown>('/centers/me/parents', body),
}
