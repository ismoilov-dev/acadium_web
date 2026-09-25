import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { SoonBadge } from '@/components/shared/States'
import { WeekdayPicker } from '@/components/shared/WeekdayPicker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateGroup, useUpdateGroup } from '@/hooks/useGroups'
import { fmtTime } from '@/lib/date'
import { optionalUrl, requiredText } from '@/lib/schemas'
import type { Group } from '@/types'

export function GroupFormDialog({
  open,
  group,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  group?: Group
  onOpenChange: (o: boolean) => void
  onSaved?: (g: Group) => void
}) {
  const { t } = useTranslation()
  const schema = z
    .object({
      name: requiredText(t),
      description: z.string(),
      days_of_week: z.array(z.number()).min(1, t('validation.days')),
      start_time: z.string().regex(/^\d{2}:\d{2}$/, t('validation.required')),
      end_time: z.string().regex(/^\d{2}:\d{2}$/, t('validation.required')),
      online_url: optionalUrl(t),
    })
    .refine((v) => v.end_time > v.start_time, {
      path: ['end_time'],
      message: t('validation.timeOrder'),
    })
  type Values = z.infer<typeof schema>

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: group?.name ?? '',
      description: group?.description ?? '',
      days_of_week: group?.days_of_week ?? [1, 3, 5],
      start_time: group ? fmtTime(group.start_time) : '14:00',
      end_time: group ? fmtTime(group.end_time) : '15:30',
      online_url: group?.online_url ?? '',
    },
  })
  const create = useCreateGroup()
  const update = useUpdateGroup()
  const { errors } = form.formState

  const submit = form.handleSubmit((v) => {
    const body = {
      name: v.name.trim(),
      description: v.description.trim(),
      days_of_week: v.days_of_week,
      start_time: v.start_time,
      end_time: v.end_time,
      online_url: v.online_url.trim(),
    }
    const done = (g: Group) => {
      onOpenChange(false)
      if (!group) form.reset()
      onSaved?.(g)
    }
    if (group) update.mutate({ id: group.id, body }, { onSuccess: done })
    else create.mutate(body, { onSuccess: done })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{group ? t('groups.edit') : t('groups.create')}</DialogTitle>
          <DialogDescription>{t('groups.formHint')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field
            label={t('fields.groupName')}
            required
            error={errors.name?.message}
            htmlFor="gr-name"
          >
            <Input
              id="gr-name"
              placeholder={t('groups.namePlaceholder')}
              {...form.register('name')}
              aria-invalid={!!errors.name}
              autoFocus
            />
          </Field>
          <Field label={t('fields.description')} htmlFor="gr-desc">
            <Textarea id="gr-desc" rows={2} {...form.register('description')} />
          </Field>
          <Field label={t('groups.days')} required error={errors.days_of_week?.message}>
            <Controller
              control={form.control}
              name="days_of_week"
              render={({ field }) => (
                <WeekdayPicker
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.days_of_week}
                />
              )}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={t('groups.start')}
              required
              error={errors.start_time?.message}
              htmlFor="gr-st"
            >
              <Input
                id="gr-st"
                type="time"
                step={300}
                {...form.register('start_time')}
                aria-invalid={!!errors.start_time}
              />
            </Field>
            <Field
              label={t('groups.end')}
              required
              error={errors.end_time?.message}
              htmlFor="gr-et"
            >
              <Input
                id="gr-et"
                type="time"
                step={300}
                {...form.register('end_time')}
                aria-invalid={!!errors.end_time}
              />
            </Field>
          </div>
          <Field
            label={t('fields.onlineUrl')}
            error={errors.online_url?.message}
            hint={t('groups.onlineHint')}
            htmlFor="gr-url"
          >
            <Input
              id="gr-url"
              placeholder="https://meet.google.com/…"
              {...form.register('online_url')}
              aria-invalid={!!errors.online_url}
            />
          </Field>
          <Field
            label={
              <span className="inline-flex items-center gap-2">
                {t('fields.teacher')} <SoonBadge />
              </span>
            }
            hint={t('groups.teacherSoon')}
          >
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder={group?.teacher_name ?? t('groups.teacherPick')} />
              </SelectTrigger>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {group ? t('common.save') : t('groups.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
