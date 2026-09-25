import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Clock, Info, RotateCw, ShieldCheck, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { Logo } from '@/components/layout/Logo'
import { Field } from '@/components/shared/Field'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { Button } from '@/components/ui/button'
import { getDeviceName } from '@/lib/device'
import { errorMessage } from '@/lib/errors'
import { formatPhone, isValidPhone, toApiPhone } from '@/lib/phone'

import { useAuth } from './AuthProvider'

export default function LoginPage() {
  const { t } = useTranslation()
  const { token, signIn } = useAuth()
  const [digits, setDigits] = useState('')
  const [touched, setTouched] = useState(false)
  const [pending, setPending] = useState<{ phone: string; requestId?: string } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const login = useMutation({
    mutationFn: (phone: string) => authApi.login(phone),
    onSuccess: (res, phone) => {
      if (res.is_trusted) {
        setFormError(null)
        signIn(res.token)
        return
      }
      setFormError(pending ? t('auth.pending.still') : null)
      setPending({ phone, requestId: res.request_id })
    },
    onError: (err) => {
      setFormError(loginErrorMessage(err))
    },
  })

  function loginErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
      const m = err.message.toLowerCase()
      if (m.includes('not found')) return t('auth.errors.notFound')
      if (m.includes('block')) return t('auth.errors.blocked')
      if (m.includes('reject')) return t('auth.errors.rejected')
    }
    return errorMessage(err, t)
  }

  if (token) return <Navigate to="/" replace />

  const invalid = touched && !isValidPhone(digits)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValidPhone(digits)) return
    login.mutate(toApiPhone(digits))
  }

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher />
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {!pending ? (
            <form onSubmit={submit} className="animate-fade-up" noValidate>
              <span className="inline-block rounded-full bg-tint px-3 py-1.5 text-[.85rem] font-semibold text-tint-foreground">
                {t('auth.tag')}
              </span>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-[2.2rem]">
                {t('auth.title')}
              </h1>
              <p className="mt-3 text-ink-soft">{t('auth.subtitle')}</p>

              <Field
                label={t('auth.phone')}
                htmlFor="phone"
                className="mt-8"
                error={invalid ? t('validation.phone') : undefined}
              >
                <PhoneInput
                  id="phone"
                  autoFocus
                  value={digits}
                  onChange={setDigits}
                  onBlur={() => setTouched(true)}
                  aria-invalid={invalid}
                  className="h-12 text-base"
                />
              </Field>

              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-bad-soft px-3.5 py-2.5 text-sm font-semibold text-bad"
                >
                  {formError}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-6 w-full" loading={login.isPending}>
                {t('auth.submit')}
              </Button>

              <p className="mt-6 flex items-start gap-2 text-sm text-ink-soft">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ok" />
                {t('auth.deviceNote', { device: getDeviceName() })}
              </p>
            </form>
          ) : (
            <div className="animate-fade-up">
              <span className="relative grid size-16 place-items-center rounded-[18px] bg-tint text-tint-foreground">
                <Smartphone className="size-8" strokeWidth={1.8} />
                <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-warn text-white ring-4 ring-background">
                  <Clock className="size-3.5" />
                </span>
              </span>
              <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t('auth.pending.title')}
              </h1>
              <p className="mt-3 text-ink-soft">
                {t('auth.pending.text', { phone: formatPhone(pending.phone) })}
              </p>

              <ol className="mt-6 grid gap-3 rounded-xl border bg-soft p-4 text-sm">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-white">
                      {n}
                    </span>
                    <span className="pt-0.5 font-medium">
                      {t(`auth.pending.step${n}`, { device: getDeviceName() })}
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                {t('auth.pending.hint')}
              </p>

              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-bad-soft px-3.5 py-2.5 text-sm font-semibold text-bad"
                >
                  {formError}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  loading={login.isPending}
                  onClick={() => login.mutate(pending.phone)}
                >
                  {!login.isPending && <RotateCw />} {t('auth.pending.retry')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPending(null)
                    setFormError(null)
                  }}
                >
                  <ArrowLeft /> {t('auth.pending.back')}
                </Button>
              </div>
              {pending.requestId && (
                <p className="mt-4 text-xs text-ink-mute">
                  {t('auth.pending.requestId')}:{' '}
                  <code className="font-mono">{pending.requestId.slice(0, 8)}</code>
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-ink-mute sm:text-left">
          © {new Date().getFullYear()} Acadium
        </p>
      </div>

      <LoginVisual />
    </div>
  )
}

/** The landing's hero mock — "Bugungi davomat" card. Decorative only. */
function LoginVisual() {
  const { t } = useTranslation()
  const bars = [45, 62, 55, 78, 70, 88, 92]
  const rows = [
    { av: 'IE', name: t('auth.visual.row1'), v: '14/14', ok: true },
    { av: 'MT', name: t('auth.visual.row2'), v: '11/12', ok: false },
    { av: 'PY', name: t('auth.visual.row3'), v: '16/16', ok: true },
  ]
  return (
    <div
      aria-hidden="true"
      className="relative hidden overflow-hidden border-l bg-soft bg-hero lg:flex lg:items-center lg:justify-center"
    >
      <div className="w-[min(480px,80%)]">
        <h2 className="mb-8 text-[2.1rem] font-extrabold leading-tight tracking-tight">
          {t('auth.visual.headline1')}{' '}
          <span className="text-gradient">{t('auth.visual.headline2')}</span>
        </h2>
        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-1.5 border-b bg-soft px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#dfe3ec]" />
            <span className="size-2.5 rounded-full bg-[#dfe3ec]" />
            <span className="size-2.5 rounded-full bg-[#dfe3ec]" />
            <span className="ml-2.5 text-[.82rem] font-semibold text-ink-soft">
              {t('attendance.today')}
            </span>
          </div>
          <div className="grid gap-4 p-[18px]">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                [t('attendance.present'), 184],
                [t('attendance.late'), 9],
                [t('attendance.absent'), 6],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-lg border p-3">
                  <small className="block text-[.74rem] font-semibold text-ink-mute">{l}</small>
                  <strong className="text-[1.45rem] font-extrabold">{v}</strong>
                </div>
              ))}
            </div>
            <div className="flex h-24 items-end gap-2 rounded-lg bg-soft px-3 pt-2.5">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t-md bg-brand opacity-85"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="grid gap-2">
              {rows.map((r) => (
                <div key={r.av} className="flex items-center gap-2.5 text-[.85rem]">
                  <span className="grid size-7 place-items-center rounded-sm bg-tint text-[.68rem] font-bold text-tint-foreground">
                    {r.av}
                  </span>
                  <span className="flex-1 font-semibold">{r.name}</span>
                  <span
                    className={
                      r.ok
                        ? 'rounded-full bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok'
                        : 'rounded-full bg-warn-soft px-2 py-0.5 text-xs font-bold text-warn'
                    }
                  >
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
