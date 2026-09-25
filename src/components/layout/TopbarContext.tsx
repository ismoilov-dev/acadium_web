import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/AuthProvider'
import { useCenter } from '@/hooks/useCenter'
import { isAdmin } from '@/lib/roles'

/** Center name for admins; role label for teachers (they can't read /centers/me). */
export function TopbarContext() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const center = useCenter()
  return (
    <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
      {isAdmin(user) && center.data?.logo_url ? (
        <img src={center.data.logo_url} alt="" className="size-8 rounded-sm object-cover" />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-tint text-tint-foreground">
          <Building2 className="size-4" />
        </span>
      )}
      <div className="min-w-0 leading-tight">
        {isAdmin(user) ? (
          center.isLoading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <p className="truncate font-bold">{center.data?.name || t('topbar.center')}</p>
          )
        ) : (
          <p className="truncate font-bold">{t('topbar.teacherPanel')}</p>
        )}
        <p className="truncate text-xs font-medium text-ink-mute">
          {user && t(`roles.${user.role}`)}
        </p>
      </div>
    </div>
  )
}
