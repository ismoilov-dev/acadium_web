import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Crosshair, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { ErrorState, ListSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCenter, useUpdateCenter } from '@/hooks/useCenter'
import { phoneDigits, toApiPhone } from '@/lib/phone'
import { optionalUrl, requiredText } from '@/lib/schemas'
import type { Center } from '@/types'

import { MapPicker } from './MapPicker'

// Tashkent city center — used only when the center has no coordinates yet.
const DEFAULT_POS = { lat: 41.311081, lng: 69.240562 }

export default function SettingsPage() {
  const { t } = useTranslation()
  const center = useCenter()
  return (
    <>
      <PageHeader title={t('nav.settings')} description={t('settings.subtitle')} />
      {center.isLoading ? (
        <Card>
          <ListSkeleton />
        </Card>
      ) : !center.data ? (
        <Card>
          <ErrorState error={center.error} onRetry={() => void center.refetch()} />
        </Card>
      ) : (
        <SettingsForm center={center.data} />
      )}
    </>
  )
}

function SettingsForm({ center }: { center: Center }) {
  const { t } = useTranslation()
  const update = useUpdateCenter()
  const [locating, setLocating] = useState(false)
  const schema = z.object({
    name: requiredText(t),
    phone: z.string().refine((v) => v === '' || phoneDigits(v).length === 9, t('validation.phone')),
    address: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    attendance_radius_meters: z
      .number()
      .int()
      .min(10, t('settings.radiusRange'))
      .max(5000, t('settings.radiusRange')),
    logo_url: optionalUrl(t),
  })
  type Values = z.infer<typeof schema>
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: center.name,
      phone: center.phone ? phoneDigits(center.phone) : '',
      address: center.address ?? '',
      latitude: center.latitude ?? DEFAULT_POS.lat,
      longitude: center.longitude ?? DEFAULT_POS.lng,
      attendance_radius_meters: center.attendance_radius_meters ?? 100,
      logo_url: center.logo_url ?? '',
    },
  })
  const { errors, isDirty } = form.formState
  const [lat, lng, radius, logo] = useWatch({
    control: form.control,
    name: ['latitude', 'longitude', 'attendance_radius_meters', 'logo_url'],
  })

  const setPos = (la: number, ln: number) => {
    form.setValue('latitude', Number(la.toFixed(6)), { shouldDirty: true, shouldValidate: true })
    form.setValue('longitude', Number(ln.toFixed(6)), { shouldDirty: true, shouldValidate: true })
  }

  const locate = () => {
    if (!navigator.geolocation) return toast.error(t('settings.geoUnsupported'))
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos(p.coords.latitude, p.coords.longitude)
        setLocating(false)
      },
      () => {
        toast.error(t('settings.geoDenied'))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const submit = form.handleSubmit((v) =>
    update.mutate({
      name: v.name.trim(),
      phone: v.phone ? toApiPhone(v.phone) : undefined,
      address: v.address.trim(),
      latitude: v.latitude,
      longitude: v.longitude,
      attendance_radius_meters: v.attendance_radius_meters,
      logo_url: v.logo_url.trim(),
    }),
  )

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]"
    >
      <Card className="h-fit">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" /> {t('settings.profile')}
            </CardTitle>
            <CardDescription className="mt-1">{t('settings.profileHint')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[16px] border bg-soft">
              {logo ? (
                <img src={logo} alt="" className="size-full object-cover" />
              ) : (
                <Building2 className="size-7 text-ink-mute" />
              )}
            </span>
            <Field
              label={t('settings.logoUrl')}
              error={errors.logo_url?.message}
              hint={t('common.urlOnlyHint')}
              htmlFor="c-logo"
              className="flex-1"
            >
              <Input
                id="c-logo"
                placeholder="https://…"
                {...form.register('logo_url')}
                aria-invalid={!!errors.logo_url}
              />
            </Field>
          </div>
          <Field label={t('settings.name')} required error={errors.name?.message} htmlFor="c-name">
            <Input id="c-name" {...form.register('name')} aria-invalid={!!errors.name} />
          </Field>
          <Field label={t('fields.phone')} error={errors.phone?.message} htmlFor="c-phone">
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="c-phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.phone}
                />
              )}
            />
          </Field>
          <Field label={t('settings.address')} htmlFor="c-addr">
            <Input
              id="c-addr"
              placeholder={t('settings.addressPlaceholder')}
              {...form.register('address')}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-violet" /> {t('settings.geofence')}
            </CardTitle>
            <CardDescription className="mt-1">{t('settings.geofenceHint')}</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={locate} loading={locating}>
            {!locating && <Crosshair />} {t('settings.myLocation')}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <MapPicker lat={lat} lng={lng} radius={radius || 0} onPick={setPos} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('settings.lat')} error={errors.latitude?.message} htmlFor="c-lat">
              <Input
                id="c-lat"
                type="number"
                step="0.000001"
                className="tabular"
                {...form.register('latitude', { valueAsNumber: true })}
              />
            </Field>
            <Field label={t('settings.lng')} error={errors.longitude?.message} htmlFor="c-lng">
              <Input
                id="c-lng"
                type="number"
                step="0.000001"
                className="tabular"
                {...form.register('longitude', { valueAsNumber: true })}
              />
            </Field>
            <Field
              label={t('settings.radius')}
              error={errors.attendance_radius_meters?.message}
              htmlFor="c-rad"
            >
              <Input
                id="c-rad"
                type="number"
                min={10}
                max={5000}
                step={10}
                className="tabular"
                {...form.register('attendance_radius_meters', { valueAsNumber: true })}
              />
            </Field>
          </div>
          <input
            type="range"
            min={20}
            max={1000}
            step={10}
            value={Math.min(1000, radius || 20)}
            onChange={(e) =>
              form.setValue('attendance_radius_meters', Number(e.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="w-full accent-[#8b5cf6]"
            aria-label={t('settings.radius')}
          />
          <p className="text-sm text-ink-soft">{t('settings.radiusHint', { radius })}</p>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end xl:col-span-2">
        <div className="flex items-center gap-3 rounded-xl border bg-card/95 p-2 pl-4 shadow-lift backdrop-blur">
          <span className="text-sm font-semibold text-ink-soft">
            {isDirty ? t('settings.unsaved') : t('settings.upToDate')}
          </span>
          <Button type="button" variant="outline" disabled={!isDirty} onClick={() => form.reset()}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </form>
  )
}
