import { Hourglass } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from './PageHeader'
import { EmptyState, SoonBadge } from './States'

export function ComingSoon({ title, description }: { title: ReactNode; description?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            {title} <SoonBadge />
          </span>
        }
      />
      <div className="rounded-xl border bg-card">
        <EmptyState
          icon={Hourglass}
          title={t('common.soonTitle')}
          description={description ?? t('common.soonText')}
        />
      </div>
    </>
  )
}
