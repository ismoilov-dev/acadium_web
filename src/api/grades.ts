import { api } from './client'
import { parseGrade } from './parsers'

export interface GradeInput {
  student_id: string
  homework_id?: string
  score: number
  comment?: string
}

export const gradesApi = {
  create: async (body: GradeInput) => parseGrade(await api.post<unknown>('/grades', body)),
  get: async (id: string) => parseGrade(await api.get<unknown>(`/grades/${id}`)),
  update: async (id: string, body: { score?: number; comment?: string }) =>
    parseGrade(await api.patch<unknown>(`/grades/${id}`, body)),
}
