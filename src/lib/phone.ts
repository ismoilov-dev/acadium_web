/** Keeps only the 9 local digits after +998. */
export function phoneDigits(value: string): string {
  let d = value.replace(/\D/g, '')
  if (d.startsWith('998') && d.length > 9) d = d.slice(3)
  return d.slice(0, 9)
}

/** "901234567" → "90 123 45 67" (progressively while typing). */
export function formatLocalPhone(digits: string): string {
  const d = phoneDigits(digits)
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return parts.join(' ')
}

/** Any phone string → "+998 90 123 45 67". Leaves foreign numbers untouched. */
export function formatPhone(value?: string | null): string {
  if (!value) return '—'
  const raw = value.replace(/\D/g, '')
  if (raw.startsWith('998') && raw.length === 12) return `+998 ${formatLocalPhone(raw.slice(3))}`
  if (raw.length === 9) return `+998 ${formatLocalPhone(raw)}`
  return value
}

/** Local digits → API format "+998901234567". */
export function toApiPhone(digits: string): string {
  return `+998${phoneDigits(digits)}`
}

export function isValidPhone(digits: string): boolean {
  return phoneDigits(digits).length === 9
}
