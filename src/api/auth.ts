import { getDeviceId, getDeviceName } from '@/lib/device'
import type { LoginResult, User } from '@/types'

import { api, asArray } from './client'

export interface LoginResponse {
  is_trusted?: boolean
  token?: string
  user?: User
  message?: string
  request_id?: string
}

export const authApi = {
  async login(phone: string): Promise<LoginResult> {
    const res = await api.post<LoginResponse>('/auth/login', {
      phone,
      device_id: getDeviceId(),
      device_name: getDeviceName(),
      platform: 'WEB',
    })
    if (res.token) return { is_trusted: true, token: res.token, user: res.user }
    return { is_trusted: false, message: res.message, request_id: res.request_id }
  },
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post<unknown>('/auth/logout'),
  devices: async () => asArray(await api.get<Device[] | null>('/auth/devices')),
  revokeDevice: (id: string) => api.delete<unknown>(`/auth/devices/${id}`),
  deviceRequests: async () =>
    asArray(await api.get<DeviceRequest[] | null>('/auth/device-requests')),
  approveRequest: (id: string) => api.post<unknown>(`/auth/device-requests/${id}/approve`),
  rejectRequest: (id: string) => api.post<unknown>(`/auth/device-requests/${id}/reject`),
}

export interface Device {
  id: string
  device_id?: string
  device_name?: string | null
  platform?: string | null
  is_trusted?: boolean
  last_login_at?: string | null
  created_at?: string
}

export interface DeviceRequest {
  id: string
  device_id?: string
  device_name?: string | null
  platform?: string | null
  status?: string
  created_at?: string
}
