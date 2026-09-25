import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { studentsApi, type StudentPatch } from '@/api/students'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useStudents = () => useQuery({ queryKey: qk.students, queryFn: studentsApi.list })

export const useStudent = (id?: string) =>
  useQuery({
    queryKey: qk.student(id ?? ''),
    queryFn: () => studentsApi.get(id ?? ''),
    enabled: !!id,
  })

export function useUpdateStudent() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: ({ id, body }: { id: string; body: StudentPatch }) => studentsApi.update(id, body),
    invalidate: [qk.students],
    success: t('common.saved'),
  })
}

export function useMoveStudent() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: ({ id, groupId }: { id: string; groupId: string }) =>
      studentsApi.moveToGroup(id, groupId),
    invalidate: [qk.students, qk.groups],
    success: t('students.moved'),
  })
}
