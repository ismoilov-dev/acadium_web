import { getDeviceId, getDeviceName } from '@/lib/device'
import { rec, str } from '@/lib/normalize'
import type { LoginResult } from '@/types'

import { api } from './client'
import { listOf, parseDevice, parseDeviceRequest, parseUser } from './parsers'

export const authApi = {
  async login(phone: string): Promise<LoginResult> {
    const res = rec(
      await api.post<unknown>('/auth/login', {
        phone,
        device_id: getDeviceId(),
        device_name: getDeviceName(),
        platform: 'WEB',
      }),
    )
    const token = str(res, ['token', 'access_token'], [])
    if (token) return { is_trusted: true, token, user: res.user ? parseUser(res.user) : undefined }
    return {
      is_trusted: false,
      message: str(res, 'message', []),
      request_id: str(res, 'request_id', []),
    }
  },
  me: async () => {
    const res = rec(await api.get<unknown>('/auth/me'))
    return parseUser(res.user ?? res)
  },
  logout: () => api.post<unknown>('/auth/logout'),
  devices: async () => listOf(parseDevice)(await api.get<unknown>('/auth/devices')),
  revokeDevice: (id: string) => api.delete<unknown>(`/auth/devices/${id}`),
  deviceRequests: async () =>
    listOf(parseDeviceRequest)(await api.get<unknown>('/auth/device-requests')),
  approveRequest: (id: string) => api.post<unknown>(`/auth/device-requests/${id}/approve`),
  rejectRequest: (id: string) => api.post<unknown>(`/auth/device-requests/${id}/reject`),
}
