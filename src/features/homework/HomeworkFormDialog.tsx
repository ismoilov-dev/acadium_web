import { zodResolver } from '@hookform/resolvers/zod'
import { BellRing } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { GroupSelect } from '@/components/shared/GroupSelect'
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
import { useCreateHomework, useUpdateHomework } from '@/hooks/useHomework'
import { isoToLocalInput, localInputToIso, now } from '@/lib/date'
import { optionalUrl, requiredText } from '@/lib/schemas'
import type { Homework } from '@/types'

export function HomeworkFormDialog({
  open,
  homework,
  defaultGroupId,
  onOpenChange,
}: {
  open: boolean
  homework?: Homework
  defaultGroupId?: string
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  const schema = z.object({
    group_id: z.string().min(1, t('validation.required')),
    title: requiredText(t),
    description: z.string(),
    deadline: z.string(),
    file_url: optionalUrl(t),
  })
  type Values = z.infer<typeof schema>
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      group_id: homework?.group_id ?? defaultGroupId ?? '',
      title: homework?.title ?? '',
      description: homework?.description ?? '',
      deadline: homework
        ? isoToLocalInput(homework.deadline)
        : now().add(2, 'day').hour(23).minute(59).format('YYYY-MM-DDTHH:mm'),
      file_url: homework?.file_url ?? '',
    },
  })
  const create = useCreateHomework()
  const update = useUpdateHomework()
  const { errors } = form.formState

  const submit = form.handleSubmit((v) => {
    const body = {
      group_id: v.group_id,
      title: v.title.trim(),
      description: v.description.trim() || undefined,
      deadline: v.deadline ? localInputToIso(v.deadline) : undefined,
      file_url: v.file_url.trim() || undefined,
    }
    const done = () => onOpenChange(false)
    if (homework) update.mutate({ id: homework.id, body }, { onSuccess: done })
    else
      create.mutate(body, {
        onSuccess: () => {
          form.reset()
          done()
        },
      })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{homework ? t('homework.edit') : t('homework.create')}</DialogTitle>
          <DialogDescription>{t('homework.formHint')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field
            label={t('fields.group')}
            required
            error={errors.group_id?.message}
            htmlFor="hw-group"
          >
            <Controller
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <GroupSelect
                  id="hw-group"
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? '')}
                  invalid={!!errors.group_id}
                  disabled={!!homework}
                />
              )}
            />
          </Field>
          <Field
            label={t('homework.title')}
            required
            error={errors.title?.message}
            htmlFor="hw-title"
          >
            <Input
              id="hw-title"
              placeholder={t('homework.titlePlaceholder')}
              {...form.register('title')}
              aria-invalid={!!errors.title}
            />
          </Field>
          <Field label={t('fields.description')} htmlFor="hw-desc">
            <Textarea
              id="hw-desc"
              rows={4}
              placeholder={t('homework.descPlaceholder')}
              {...form.register('description')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('homework.deadline')} htmlFor="hw-deadline" hint={t('homework.tzHint')}>
              <Input id="hw-deadline" type="datetime-local" {...form.register('deadline')} />
            </Field>
            <Field label={t('homework.fileUrl')} error={errors.file_url?.message} htmlFor="hw-file">
              <Input
                id="hw-file"
                placeholder="https://…"
                {...form.register('file_url')}
                aria-invalid={!!errors.file_url}
              />
            </Field>
          </div>
          {!homework && (
            <p className="flex items-start gap-2.5 rounded-lg bg-tint px-3.5 py-3 text-sm font-semibold text-tint-foreground">
              <BellRing className="mt-0.5 size-4 shrink-0" />
              {t('homework.notifyNote')}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {homework ? t('common.save') : t('homework.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
