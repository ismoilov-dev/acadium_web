import type { TFunction } from 'i18next'
import { z } from 'zod'

import { isValidPhone } from './phone'

export const phoneField = (t: TFunction) => z.string().refine(isValidPhone, t('validation.phone'))

export const requiredText = (t: TFunction) => z.string().trim().min(1, t('validation.required'))

export const optionalUrl = (t: TFunction) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), t('validation.url'))

/** Drops empty strings so PATCH/POST bodies only carry filled fields. */
export function compact<T extends Record<string, unknown>>(o: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(o)) {
    if (v === '' || v === undefined || v === null) continue
    ;(out as Record<string, unknown>)[k] = typeof v === 'string' ? v.trim() : v
  }
  return out
}
