/* eslint-disable react-refresh/only-export-components */
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { now } from '@/lib/date'
import type { Debate } from '@/types'

export type DebatePhase = 'live' | 'upcoming' | 'ended'

export function debatePhase(d: Debate): DebatePhase {
  const s = (d.status ?? '').toUpperCase()
  if (s === 'ACTIVE' || s === 'LIVE') return 'live'
  if (s === 'FINISHED' || s === 'ENDED' || s === 'CLOSED') return 'ended'
  if (d.ends_at && now().isAfter(d.ends_at)) return 'ended'
  if (d.starts_at && now().isBefore(d.starts_at)) return 'upcoming'
  return 'live'
}

export function PhaseBadge({ debate }: { debate: Debate }) {
  const { t } = useTranslation()
  const p = debatePhase(debate)
  if (p === 'live')
    return (
      <Badge variant="ok">
        <span className="size-1.5 animate-pulse rounded-full bg-ok" /> {t('arena.live')}
      </Badge>
    )
  if (p === 'upcoming') return <Badge>{t('arena.upcoming')}</Badge>
  return <Badge variant="muted">{t('arena.ended')}</Badge>
}
