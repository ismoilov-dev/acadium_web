import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LANGS } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()
  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('common.language')}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border bg-card px-2.5 text-sm font-semibold transition-colors hover:bg-soft data-[state=open]:border-primary data-[state=open]:shadow-[0_0_0_3px_rgba(74,158,237,.15)]"
      >
        <Globe className="size-4 text-ink-mute" />
        <span className={cn('font-extrabold tracking-wide', !compact && 'sm:hidden')}>
          {current.short}
        </span>
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        <ChevronDown className="size-3.5 text-ink-mute" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((l) => {
          const active = l.code === current.code
          return (
            <DropdownMenuItem
              key={l.code}
              onSelect={() => void i18n.changeLanguage(l.code)}
              className={cn(active && 'bg-tint font-semibold text-foreground')}
            >
              <span
                className={cn(
                  'grid h-[22px] w-7 place-items-center rounded-md bg-soft text-[.68rem] font-extrabold tracking-wide text-ink-soft',
                  active && 'bg-brand text-white',
                )}
              >
                {l.short}
              </span>
              <span className="flex-1">{l.label}</span>
              <Check className={cn('text-primary', !active && 'opacity-0')} />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
