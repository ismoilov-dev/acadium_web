import {
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Star,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import type { Role } from '@/types'

export interface NavItem {
  to: string
  label: string // i18n key
  icon: LucideIcon
  roles: Role[]
  soon?: boolean
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

const A: Role[] = ['CENTER_ADMIN']
const T: Role[] = ['TEACHER']
const AT: Role[] = ['CENTER_ADMIN', 'TEACHER']

export const NAV: NavSection[] = [
  {
    items: [{ to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard, roles: AT }],
  },
  {
    label: 'nav.sections.people',
    items: [
      { to: '/students', label: 'nav.students', icon: GraduationCap, roles: A },
      { to: '/teachers', label: 'nav.teachers', icon: UserRound, roles: A },
      { to: '/parents', label: 'nav.parents', icon: UsersRound, roles: A },
    ],
  },
  {
    label: 'nav.sections.study',
    items: [
      { to: '/groups', label: 'nav.groups', icon: Users, roles: A },
      { to: '/groups', label: 'nav.myGroups', icon: Users, roles: T },
      { to: '/schedule', label: 'nav.schedule', icon: CalendarDays, roles: AT },
      { to: '/attendance', label: 'nav.attendance', icon: ClipboardCheck, roles: AT },
      { to: '/homework', label: 'nav.homework', icon: BookOpenCheck, roles: AT },
      { to: '/grades', label: 'nav.grades', icon: Star, roles: AT },
      { to: '/arena', label: 'nav.arena', icon: MessagesSquare, roles: AT },
    ],
  },
  {
    label: 'nav.sections.center',
    items: [
      { to: '/payments', label: 'nav.payments', icon: Wallet, roles: A, soon: true },
      { to: '/settings', label: 'nav.settings', icon: Settings, roles: A },
    ],
  },
]

export function navFor(role?: Role): NavSection[] {
  if (!role) return []
  return NAV.map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(role)) })).filter(
    (s) => s.items.length > 0,
  )
}
