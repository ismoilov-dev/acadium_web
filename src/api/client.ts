import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

import { API_BASE_URL } from '@/lib/env'
import { tokenStore } from '@/lib/storage'

interface Envelope<T> {
  success: boolean
  data: T
  error: { message?: string } | null
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const http = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Called when refresh fails — AuthProvider registers a handler that clears the session. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

let refreshing: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  const token = tokenStore.get()
  if (!token) return null
  try {
    const res = await axios.post<Envelope<{ token?: string }>>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15_000 },
    )
    const next = res.data?.data?.token
    if (next) {
      tokenStore.set(next)
      return next
    }
    return null
  } catch {
    return null
  }
}

type RetriableConfig = InternalAxiosRequestConfig & {
  _retried?: boolean
  _skipAuthRefresh?: boolean
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Envelope<unknown>>) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status ?? 0

    if (
      status === 401 &&
      config &&
      !config._retried &&
      !config._skipAuthRefresh &&
      tokenStore.get()
    ) {
      config._retried = true
      refreshing ??= refreshToken().finally(() => {
        refreshing = null
      })
      const next = await refreshing
      if (next) {
        config.headers.Authorization = `Bearer ${next}`
        return http(config)
      }
      tokenStore.clear()
      onUnauthorized?.()
    }

    const message =
      error.response?.data?.error?.message ??
      (error.code === 'ECONNABORTED' ? 'timeout' : error.response ? error.message : 'network')
    return Promise.reject(new ApiError(message, status))
  },
)

async function unwrap<T>(p: Promise<{ data: Envelope<T> }>): Promise<T> {
  const res = await p
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new ApiError(body.error?.message ?? 'unknown', 200)
    return body.data
  }
  return body as unknown as T
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(http.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(http.post(url, body ?? {}, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(http.patch(url, body ?? {}, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(http.delete(url, config)),
}

/** Lists may come back as `null` from Go when empty. */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}
