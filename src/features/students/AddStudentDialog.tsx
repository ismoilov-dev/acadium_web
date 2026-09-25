import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PhoneInput } from '@/components/shared/PhoneInput'
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
import { useAddStudent } from '@/hooks/useCenter'
import { toApiPhone } from '@/lib/phone'
import { compact, phoneField, requiredText } from '@/lib/schemas'

export function AddStudentDialog({
  open,
  onOpenChange,
  defaultGroupId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultGroupId?: string
}) {
  const { t } = useTranslation()
  const schema = z.object({
    phone: phoneField(t),
    first_name: requiredText(t),
    last_name: z.string(),
    group_id: z.string().optional(),
  })
  type Values = z.infer<typeof schema>
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', first_name: '', last_name: '', group_id: defaultGroupId },
  })
  const add = useAddStudent()
  const { errors } = form.formState

  const submit = form.handleSubmit((v) =>
    add.mutate(compact({ ...v, phone: toApiPhone(v.phone) }) as Values, {
      onSuccess: () => {
        form.reset({ phone: '', first_name: '', last_name: '', group_id: defaultGroupId })
        onOpenChange(false)
      },
    }),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('students.add')}</DialogTitle>
          <DialogDescription>{t('students.addHint')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field
            label={t('fields.phone')}
            required
            error={errors.phone?.message}
            htmlFor="st-phone"
          >
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="st-phone"
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
              htmlFor="st-fn"
            >
              <Input
                id="st-fn"
                {...form.register('first_name')}
                aria-invalid={!!errors.first_name}
              />
            </Field>
            <Field label={t('fields.lastName')} htmlFor="st-ln">
              <Input id="st-ln" {...form.register('last_name')} />
            </Field>
          </div>
          <Field label={t('fields.group')} htmlFor="st-group" hint={t('students.groupHint')}>
            <Controller
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <GroupSelect
                  id="st-group"
                  value={field.value}
                  onChange={field.onChange}
                  allowNone
                />
              )}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={add.isPending}>
              {t('students.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
