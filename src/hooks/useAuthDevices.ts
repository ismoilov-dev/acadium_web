import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { authApi } from '@/api/auth'

import { qk } from './keys'
import { useApiMutation } from './useApiMutation'

export const useDevices = () => useQuery({ queryKey: qk.devices, queryFn: authApi.devices })

export const useDeviceRequests = () =>
  useQuery({
    queryKey: qk.deviceRequests,
    queryFn: authApi.deviceRequests,
    refetchInterval: 15_000,
  })

export function useRevokeDevice() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: authApi.revokeDevice,
    invalidate: [qk.devices],
    success: t('devices.revoked'),
  })
}

export function useApproveRequest() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: authApi.approveRequest,
    invalidate: [qk.deviceRequests, qk.devices],
    success: t('devices.approved'),
  })
}

export function useRejectRequest() {
  const { t } = useTranslation()
  return useApiMutation({
    mutationFn: authApi.rejectRequest,
    invalidate: [qk.deviceRequests],
    success: t('devices.rejected'),
  })
}
