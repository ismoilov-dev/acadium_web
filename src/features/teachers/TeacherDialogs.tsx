import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAddTeacher } from '@/hooks/useCenter'
import { useUpdateTeacher } from '@/hooks/useTeachers'
import { toApiPhone } from '@/lib/phone'
import { initials } from '@/lib/roles'
import { optionalUrl, phoneField, requiredText } from '@/lib/schemas'
import type { Teacher } from '@/types'

export function AddTeacherDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  const schema = z.object({
    phone: phoneField(t),
    first_name: requiredText(t),
    last_name: z.string(),
    specialization: z.string(),
  })
  type Values = z.infer<typeof schema>
  const empty: Values = { phone: '', first_name: '', last_name: '', specialization: '' }
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty })
  const add = useAddTeacher()
  const { errors } = form.formState

  const submit = form.handleSubmit((v) =>
    add.mutate(
      {
        phone: toApiPhone(v.phone),
        first_name: v.first_name.trim(),
        last_name: v.last_name.trim() || undefined,
        specialization: v.specialization.trim() || undefined,
      },
      {
        onSuccess: () => {
          form.reset(empty)
          onOpenChange(false)
        },
      },
    ),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teachers.add')}</DialogTitle>
          <DialogDescription>{t('teachers.addHint')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field
            label={t('fields.phone')}
            required
            error={errors.phone?.message}
            htmlFor="tc-phone"
          >
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="tc-phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.phone}
                  autoFocus
                />
              )}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('fields.firstName')}
              required
              error={errors.first_name?.message}
              htmlFor="tc-fn"
            >
              <Input
                id="tc-fn"
                {...form.register('first_name')}
                aria-invalid={!!errors.first_name}
              />
            </Field>
            <Field label={t('fields.lastName')} htmlFor="tc-ln">
              <Input id="tc-ln" {...form.register('last_name')} />
            </Field>
          </div>
          <Field label={t('fields.specialization')} htmlFor="tc-sp">
            <Input
              id="tc-sp"
              placeholder={t('teachers.specPlaceholder')}
              {...form.register('specialization')}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={add.isPending}>
              {t('teachers.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditTeacherDialog({
  teacher,
  onOpenChange,
}: {
  teacher?: Teacher
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  const schema = z.object({
    first_name: requiredText(t),
    last_name: z.string(),
    specialization: z.string(),
    avatar_url: optionalUrl(t),
  })
  type Values = z.infer<typeof schema>
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      first_name: teacher?.first_name ?? '',
      last_name: teacher?.last_name ?? '',
      specialization: teacher?.specialization ?? '',
      avatar_url: teacher?.avatar_url ?? '',
    },
  })
  const update = useUpdateTeacher()
  const { errors } = form.formState
  const avatar = useWatch({ control: form.control, name: 'avatar_url' })

  return (
    <Dialog open={!!teacher} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teachers.edit')}</DialogTitle>
          <DialogDescription>{t('teachers.editHint')}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={form.handleSubmit(
            (v) =>
              teacher &&
              update.mutate(
                {
                  id: teacher.id,
                  body: {
                    first_name: v.first_name.trim(),
                    last_name: v.last_name.trim(),
                    specialization: v.specialization.trim(),
                    avatar_url: v.avatar_url.trim(),
                  },
                },
                { onSuccess: () => onOpenChange(false) },
              ),
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('fields.firstName')}
              required
              error={errors.first_name?.message}
              htmlFor="te-fn"
            >
              <Input
                id="te-fn"
                {...form.register('first_name')}
                aria-invalid={!!errors.first_name}
              />
            </Field>
            <Field label={t('fields.lastName')} htmlFor="te-ln">
              <Input id="te-ln" {...form.register('last_name')} />
            </Field>
          </div>
          <Field label={t('fields.specialization')} htmlFor="te-sp">
            <Input
              id="te-sp"
              placeholder={t('teachers.specPlaceholder')}
              {...form.register('specialization')}
            />
          </Field>
          <Field
            label={t('fields.avatarUrl')}
            error={errors.avatar_url?.message}
            hint={t('common.urlOnlyHint')}
            htmlFor="te-av"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                {avatar && <AvatarImage src={avatar} alt="" />}
                <AvatarFallback>{initials(teacher)}</AvatarFallback>
              </Avatar>
              <Input
                id="te-av"
                placeholder="https://…"
                {...form.register('avatar_url')}
                aria-invalid={!!errors.avatar_url}
              />
            </div>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={update.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
