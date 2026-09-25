import { LogOut, RotateCw, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo, LogoMark } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/errors'
import { canUsePanel } from '@/lib/roles'
import type { Role } from '@/types'

import { useAuth } from './AuthProvider'

export function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-soft">
      <LogoMark className="size-12 animate-pulse rounded-xl [&_svg]:size-7" />
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-soft bg-hero px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <Logo />
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

/** Requires a token + a user whose role may use the web panel. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { token, user, loading, error, signOut, refetchUser } = useAuth()
  const location = useLocation()

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (loading) return <FullScreenLoader />

  if (!user) {
    return (
      <Shell>
        <h1 className="text-2xl font-extrabold">{t('states.errorTitle')}</h1>
        <p className="mt-2 text-ink-soft">{errorMessage(error, t)}</p>
        <div className="mt-6 flex gap-2">
          <Button onClick={refetchUser}>
            <RotateCw /> {t('common.retry')}
          </Button>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut /> {t('auth.logout')}
          </Button>
        </div>
      </Shell>
    )
  }

  if (!canUsePanel(user)) {
    return (
      <Shell>
        <span className="grid size-16 place-items-center rounded-[18px] bg-tint text-tint-foreground">
          <Smartphone className="size-8" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          {t('auth.mobileOnly.title')}
        </h1>
        <p className="mt-3 text-ink-soft">
          {t('auth.mobileOnly.text', { role: t(`roles.${user.role}`) })}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => void signOut()}>
          <LogOut /> {t('auth.logout')}
        </Button>
      </Shell>
    )
  }

  return <>{children}</>
}

/** Hides admin-only routes from teachers (and vice-versa). */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
