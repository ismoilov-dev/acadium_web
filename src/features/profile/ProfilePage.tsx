import {
  Check,
  Laptop,
  MonitorSmartphone,
  ShieldAlert,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { UserStatusBadge } from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useApproveRequest,
  useDeviceRequests,
  useDevices,
  useRejectRequest,
  useRevokeDevice,
} from '@/hooks/useAuthDevices'
import { getDeviceId } from '@/lib/device'
import { fmtDate, fmtDateTime, fromNow } from '@/lib/date'
import { formatPhone } from '@/lib/phone'
import { fullName, initials } from '@/lib/roles'
import type { Device } from '@/types'

function PlatformIcon({ platform }: { platform?: string }) {
  const p = (platform ?? '').toUpperCase()
  if (p === 'WEB') return <Laptop className="size-5" />
  return <Smartphone className="size-5" />
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'profile'
  const requests = useDeviceRequests()
  const pendingCount = requests.data?.length ?? 0

  return (
    <>
      <PageHeader title={t('nav.profile')} />
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'profile' ? {} : { tab: v })}>
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound /> {t('nav.profile')}
          </TabsTrigger>
          <TabsTrigger value="devices">
            <MonitorSmartphone /> {t('nav.devices')}
            {pendingCount > 0 && <Badge variant="warn">{pendingCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="max-w-2xl">
            <div className="flex items-center gap-4 border-b bg-soft bg-hero p-6">
              <Avatar className="size-16 rounded-[16px]">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                <AvatarFallback className="text-lg">{initials(user)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-extrabold">{fullName(user)}</h2>
                <p className="font-medium text-ink-soft">{user && t(`roles.${user.role}`)}</p>
              </div>
            </div>
            <dl className="grid gap-4 p-6 sm:grid-cols-2">
              <Info label={t('fields.phone')} value={formatPhone(user?.phone)} />
              <Info label={t('fields.status')} value={<UserStatusBadge status={user?.status} />} />
              <Info label={t('fields.createdAt')} value={fmtDate(user?.created_at)} />
              <Info
                label={t('profile.thisDevice')}
                value={<code className="text-xs">{getDeviceId().slice(0, 8)}…</code>}
              />
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="grid gap-6">
          <PendingRequests />
          <TrustedDevices />
        </TabsContent>
      </Tabs>
    </>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-mute">{label}</dt>
      <dd className="tabular mt-1 font-semibold">{value}</dd>
    </div>
  )
}

function PendingRequests() {
  const { t } = useTranslation()
  const q = useDeviceRequests()
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const items = q.data ?? []

  return (
    <Card className={items.length ? 'border-warn/40' : undefined}>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-warn" /> {t('devices.pendingTitle')}
          </CardTitle>
          <CardDescription className="mt-1">{t('devices.pendingHint')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {q.isLoading ? (
          <ListSkeleton rows={2} />
        ) : q.error ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={Check} title={t('devices.noPending')} className="py-8" />
        ) : (
          <ul className="divide-y border-t">
            {items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="grid size-10 place-items-center rounded-lg bg-warn-soft text-warn">
                  <PlatformIcon platform={r.platform} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{r.device_name || t('devices.unknown')}</p>
                  <p className="tabular text-xs text-ink-mute">
                    {r.platform ?? '—'} · {fmtDateTime(r.created_at)} ({fromNow(r.created_at)})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={approve.isPending && approve.variables === r.id}
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => approve.mutate(r.id)}
                  >
                    <Check /> {t('devices.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={reject.isPending && reject.variables === r.id}
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => reject.mutate(r.id)}
                  >
                    <X /> {t('devices.reject')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function TrustedDevices() {
  const { t } = useTranslation()
  const q = useDevices()
  const revoke = useRevokeDevice()
  const [target, setTarget] = useState<Device>()
  const mine = getDeviceId()

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{t('devices.trustedTitle')}</CardTitle>
          <CardDescription className="mt-1">{t('devices.trustedHint')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {q.isLoading ? (
          <ListSkeleton rows={2} />
        ) : q.error ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState icon={MonitorSmartphone} title={t('devices.none')} className="py-8" />
        ) : (
          <ul className="divide-y border-t">
            {(q.data ?? []).map((d) => {
              const current = d.device_id === mine
              return (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid size-10 place-items-center rounded-lg bg-tint text-tint-foreground">
                    <PlatformIcon platform={d.platform} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-bold">
                      {d.device_name || t('devices.unknown')}
                      {current && <Badge variant="ok">{t('devices.current')}</Badge>}
                      {d.is_trusted === false && (
                        <Badge variant="warn">{t('devices.untrusted')}</Badge>
                      )}
                    </p>
                    <p className="tabular text-xs text-ink-mute">
                      {d.platform ?? '—'} · {t('devices.lastSeen')}:{' '}
                      {fmtDateTime(d.last_login_at ?? d.created_at)}
                    </p>
                  </div>
                  {!current && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-bad hover:bg-bad-soft hover:text-bad"
                      aria-label={t('devices.revoke')}
                      onClick={() => setTarget(d)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(undefined)}
        title={t('devices.revokeTitle')}
        description={t('devices.revokeText', { name: target?.device_name ?? '' })}
        confirmLabel={t('devices.revoke')}
        loading={revoke.isPending}
        onConfirm={() =>
          target && revoke.mutate(target.id, { onSuccess: () => setTarget(undefined) })
        }
      />
    </Card>
  )
}
