import { Menu } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'

import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { Sidebar, SidebarNav } from './Sidebar'
import { UserMenu } from './UserMenu'

const COLLAPSE_KEY = 'acadium.sidebar.collapsed'

export function AppLayout({
  topbarStart,
  topbarEnd,
}: {
  topbarStart?: ReactNode
  topbarEnd?: ReactNode
}) {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  return (
    <div className="flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="lg:hidden">
          <DialogTitle className="sr-only">{t('nav.menu')}</DialogTitle>
          <DialogDescription className="sr-only">{t('nav.aria')}</DialogDescription>
          <div className="flex h-[68px] items-center px-5">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[68px] items-center gap-2 border-b bg-card/85 px-4 backdrop-blur-md backdrop-saturate-150 sm:gap-3 sm:px-6">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t('nav.menu')}
          >
            <Menu />
          </Button>
          <Link to="/dashboard" className="lg:hidden" aria-label="Acadium">
            <Logo collapsed />
          </Link>
          <div className="min-w-0 flex-1">{topbarStart}</div>
          <LanguageSwitcher />
          {topbarEnd}
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
