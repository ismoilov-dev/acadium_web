import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { arenaApi, type DebateInput } from '@/api/arena'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useDebates = () => useQuery({ queryKey: qk.debates, queryFn: arenaApi.list })

export const useDebate = (id?: string) =>
  useQuery({ queryKey: qk.debate(id ?? ''), queryFn: () => arenaApi.get(id ?? ''), enabled: !!id })

export function useCreateDebate() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: (b: DebateInput) => arenaApi.create(b),
    invalidate: [qk.debates],
    success: t('arena.created'),
  })
}
