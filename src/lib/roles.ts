import type { Role, User } from '@/types'

export const PANEL_ROLES: Role[] = ['CENTER_ADMIN', 'TEACHER']

export const isAdmin = (u?: User) => u?.role === 'CENTER_ADMIN'
export const isTeacher = (u?: User) => u?.role === 'TEACHER'
export const canUsePanel = (u?: User) => !!u && PANEL_ROLES.includes(u.role)

export function fullName(
  p?: { first_name?: string | null; last_name?: string | null } | null,
): string {
  if (!p) return '—'
  return [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || '—'
}

export function initials(
  p?: { first_name?: string | null; last_name?: string | null } | null,
): string {
  const a = p?.first_name?.trim()?.[0] ?? ''
  const b = p?.last_name?.trim()?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}
