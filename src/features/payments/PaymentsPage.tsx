import { useTranslation } from 'react-i18next'

import { ComingSoon } from '@/components/shared/ComingSoon'

export default function PaymentsPage() {
  const { t } = useTranslation()
  return <ComingSoon title={t('nav.payments')} description={t('payments.soon')} />
}
