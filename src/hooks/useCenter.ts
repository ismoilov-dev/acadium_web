import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  centersApi,
  type AddParentInput,
  type AddStudentInput,
  type AddTeacherInput,
  type CenterInput,
} from '@/api/centers'
import { useAuth } from '@/features/auth/AuthProvider'
import type { Role } from '@/types'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export function useCenter() {
  const { user } = useAuth()
  return useQuery({
    queryKey: qk.center,
    queryFn: centersApi.me,
    enabled: user?.role === 'CENTER_ADMIN',
    staleTime: 5 * 60_000,
  })
}

export function useMembers(role?: Role) {
  return useQuery({
    queryKey: qk.members,
    queryFn: centersApi.members,
    select: role ? (rows) => rows.filter((m) => m.role === role) : undefined,
  })
}

export function useUpdateCenter() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: CenterInput) => centersApi.update(b),
    invalidate: [qk.center],
    success: t('settings.saved'),
  })
}

export function useAddStudent() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: AddStudentInput) => centersApi.addStudent(b),
    invalidate: [qk.students, qk.members, qk.groups],
    success: t('students.added'),
  })
}

export function useAddTeacher() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: AddTeacherInput) => centersApi.addTeacher(b),
    invalidate: [qk.teachers, qk.members],
    success: t('teachers.added'),
  })
}

export function useAddParent() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: AddParentInput) => centersApi.addParent(b),
    invalidate: [qk.members, qk.students],
    success: t('parents.added'),
  })
}
