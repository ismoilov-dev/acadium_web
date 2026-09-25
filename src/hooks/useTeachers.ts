import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { teachersApi, type TeacherPatch } from '@/api/teachers'
import { useAuth } from '@/features/auth/AuthProvider'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useTeachers = () => useQuery({ queryKey: qk.teachers, queryFn: teachersApi.list })

export const useTeacher = (id?: string) =>
  useQuery({
    queryKey: qk.teacher(id ?? ''),
    queryFn: () => teachersApi.get(id ?? ''),
    enabled: !!id,
  })

export function useTeacherDashboard() {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.teacherDashboard,
    queryFn: teachersApi.dashboard,
    enabled: user?.role === 'TEACHER',
  })
}

export const useAttendance = (params?: { date?: string; group_id?: string }) =>
  useQuery({
    queryKey: qk.attendance(params),
    queryFn: () => teachersApi.attendance(params),
    refetchInterval: 60_000,
  })

export function useUpdateTeacher() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: ({ id, body }: { id: string; body: TeacherPatch }) => teachersApi.update(id, body),
    invalidate: [qk.teachers],
    success: t('common.saved'),
  })
}
