import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { homeworkState } from '@/lib/homework'
import type { Homework } from '@/types'

export function HomeworkStateBadge({ hw }: { hw: Homework }) {
  const { t } = useTranslation()
  const s = homeworkState(hw)
  if (s === 'overdue') return <Badge variant="muted">{t('homework.closed')}</Badge>
  if (s === 'soon') return <Badge variant="warn">{t('homework.soon')}</Badge>
  if (s === 'active') return <Badge variant="ok">{t('homework.active')}</Badge>
  return <Badge variant="outline">{t('homework.noDeadline')}</Badge>
}
