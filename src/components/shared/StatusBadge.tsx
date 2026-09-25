import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import type { AttendanceStatus } from '@/types'

export function UserStatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation()
  const s = (status ?? 'ACTIVE').toUpperCase()
  if (s === 'BLOCKED') return <Badge variant="bad">{t('status.BLOCKED')}</Badge>
  if (s === 'ACTIVE') return <Badge variant="ok">{t('status.ACTIVE')}</Badge>
  return <Badge variant="muted">{t(`status.${s}`, { defaultValue: s })}</Badge>
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const { t } = useTranslation()
  const variant =
    status === 'PRESENT' ? 'ok' : status === 'LATE' ? 'warn' : status === 'ABSENT' ? 'bad' : 'muted'
  return <Badge variant={variant}>{t(`attendance.status.${status}`)}</Badge>
}

/** 0–100 score, colour-coded: ≥85 green, ≥60 blue, ≥40 amber, else red. */
export function ScoreBadge({ score, className }: { score?: number; className?: string }) {
  if (score === undefined || Number.isNaN(score))
    return (
      <Badge variant="muted" className={className}>
        —
      </Badge>
    )
  const variant = score >= 85 ? 'ok' : score >= 60 ? 'default' : score >= 40 ? 'warn' : 'bad'
  return (
    <Badge variant={variant} className={className}>
      {Number.isInteger(score) ? score : score.toFixed(1)}
    </Badge>
  )
}
