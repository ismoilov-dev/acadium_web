import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { groupsApi, type GroupInput } from '@/api/groups'
import { useAuth } from '@/features/auth/AuthProvider'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useGroups = () => useQuery({ queryKey: qk.groups, queryFn: groupsApi.list })

/** Admin → all center groups; teacher → /teacher/groups. */
export function useVisibleGroups() {
  const { user } = useAuth()
  const teacher = user?.role === 'TEACHER'
  return useQuery({
    queryKey: teacher ? qk.myGroups : qk.groups,
    queryFn: teacher ? groupsApi.mine : groupsApi.list,
  })
}

export const useGroup = (id?: string) =>
  useQuery({ queryKey: qk.group(id ?? ''), queryFn: () => groupsApi.get(id ?? ''), enabled: !!id })

export function useCreateGroup() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: GroupInput) => groupsApi.create(b),
    invalidate: [qk.groups],
    success: t('groups.created'),
  })
}

export function useUpdateGroup() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<GroupInput> }) =>
      groupsApi.update(id, body),
    invalidate: [qk.groups],
    success: t('groups.updated'),
  })
}

export function useDeleteGroup() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (id: string) => groupsApi.remove(id),
    invalidate: [qk.groups, qk.students],
    success: t('groups.deleted'),
  })
}
