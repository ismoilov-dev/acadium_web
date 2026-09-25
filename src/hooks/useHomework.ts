import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { homeworkApi, type HomeworkInput } from '@/api/homework'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useHomeworkList = (groupId?: string) =>
  useQuery({ queryKey: qk.homework(groupId), queryFn: () => homeworkApi.list(groupId) })

export const useHomework = (id?: string) =>
  useQuery({
    queryKey: qk.homeworkOne(id ?? ''),
    queryFn: () => homeworkApi.get(id ?? ''),
    enabled: !!id,
  })

export function useCreateHomework() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: HomeworkInput) => homeworkApi.create(b),
    invalidate: [['homework']],
    success: t('homework.created'),
  })
}

export function useUpdateHomework() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<HomeworkInput> }) =>
      homeworkApi.update(id, body),
    invalidate: [['homework']],
    success: t('homework.updated'),
  })
}

export function useDeleteHomework() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (id: string) => homeworkApi.remove(id),
    invalidate: [['homework']],
    success: t('homework.deleted'),
  })
}
