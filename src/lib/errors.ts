import type { TFunction } from 'i18next'

import { ApiError } from '@/api/client'

/** Maps API / network errors to a user-facing message. Backend messages are shown as-is. */
export function errorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    if (error.message === 'network') return t('errors.network')
    if (error.message === 'timeout') return t('errors.timeout')
    if (error.status === 403) return error.message || t('errors.forbidden')
    if (error.status >= 500 && !error.message) return t('errors.server')
    return error.message
  }
  if (error instanceof Error) return error.message
  return t('errors.unknown')
}
