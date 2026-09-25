import { ChevronDown, LogOut, Moon, MonitorSmartphone, Sun, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatPhone } from '@/lib/phone'
import { fullName, initials } from '@/lib/roles'
import { useTheme } from '@/lib/theme'

export function UserMenu() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-md pl-1 pr-2 transition-colors hover:bg-soft data-[state=open]:bg-soft">
        <Avatar className="size-8">
          {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback>{initials(user)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-[160px] truncate text-sm font-bold">{fullName(user)}</span>
          <span className="block text-xs font-medium text-ink-mute">
            {user && t(`roles.${user.role}`)}
          </span>
        </span>
        <ChevronDown className="hidden size-3.5 text-ink-mute md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate font-bold">{fullName(user)}</span>
          <span className="tabular block text-xs font-medium text-ink-mute">
            {formatPhone(user?.phone)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/profile')}>
          <UserRound /> {t('nav.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/profile?tab=devices')}>
          <MonitorSmartphone /> {t('nav.devices')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            toggle()
          }}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}{' '}
          {theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void signOut()}
          className="text-bad focus:bg-bad-soft focus:text-bad"
        >
          <LogOut /> {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
