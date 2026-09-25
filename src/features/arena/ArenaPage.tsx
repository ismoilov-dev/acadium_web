import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, MessagesSquare, Plus, Radio, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Field } from '@/components/shared/Field'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { CardsSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input, Textarea } from '@/components/ui/input'
import { useCreateDebate, useDebates } from '@/hooks/useArena'
import { useVisibleGroups } from '@/hooks/useGroups'
import { fmtDateTime, localInputToIso, now } from '@/lib/date'
import { requiredText } from '@/lib/schemas'
import { debatePhase, PhaseBadge, type DebatePhase } from './phase'

export default function ArenaPage() {
  const { t } = useTranslation()
  const debates = useDebates()
  const groups = useVisibleGroups()
  const [creating, setCreating] = useState(false)
  const groupName = useMemo(
    () => new Map((groups.data ?? []).map((g) => [g.id, g.name])),
    [groups.data],
  )
  const order: Record<DebatePhase, number> = { live: 0, upcoming: 1, ended: 2 }
  const list = [...(debates.data ?? [])].sort(
    (a, b) =>
      order[debatePhase(a)] - order[debatePhase(b)] ||
      (b.starts_at ?? b.created_at ?? '').localeCompare(a.starts_at ?? a.created_at ?? ''),
  )

  return (
    <>
      <PageHeader
        title={t('nav.arena')}
        description={t('arena.subtitle')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> {t('arena.create')}
          </Button>
        }
      />
      {debates.isLoading ? (
        <CardsSkeleton count={3} className="xl:grid-cols-3" />
      ) : debates.error ? (
        <Card>
          <ErrorState error={debates.error} onRetry={() => void debates.refetch()} />
        </Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessagesSquare}
            title={t('arena.empty')}
            description={t('arena.emptyHint')}
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus /> {t('arena.create')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => (
            <Link
              key={d.id}
              to={`/arena/${d.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-[14px] bg-tint text-tint-foreground transition-colors group-hover:bg-brand group-hover:text-white">
                  <MessagesSquare className="size-5" />
                </span>
                <PhaseBadge debate={d} />
              </div>
              <p className="mt-4 line-clamp-2 text-[1.05rem] font-bold">{d.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{d.topic}</p>
              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs font-semibold text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {d.group_name ?? groupName.get(d.group_id) ?? '—'}
                </span>
                {d.starts_at && (
                  <span className="tabular inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" /> {fmtDateTime(d.starts_at)}
                  </span>
                )}
                {debatePhase(d) === 'live' && (
                  <span className="ml-auto inline-flex items-center gap-1 text-ok">
                    <Radio className="size-3.5" /> {t('arena.watch')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <CreateDebateDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}

function CreateDebateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  const schema = z
    .object({
      group_id: z.string().min(1, t('validation.required')),
      title: requiredText(t),
      topic: requiredText(t),
      starts_at: z.string(),
      ends_at: z.string(),
    })
    .refine((v) => !v.starts_at || !v.ends_at || v.ends_at > v.starts_at, {
      path: ['ends_at'],
      message: t('validation.timeOrder'),
    })
  type Values = z.infer<typeof schema>
  const start = now().add(1, 'hour').minute(0)
  const empty: Values = {
    group_id: '',
    title: '',
    topic: '',
    starts_at: start.format('YYYY-MM-DDTHH:mm'),
    ends_at: start.add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  }
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty })
  const create = useCreateDebate()
  const { errors } = form.formState

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('arena.create')}</DialogTitle>
          <DialogDescription>{t('arena.createHint')}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={form.handleSubmit((v) =>
            create.mutate(
              {
                group_id: v.group_id,
                title: v.title.trim(),
                topic: v.topic.trim(),
                starts_at: v.starts_at ? localInputToIso(v.starts_at) : undefined,
                ends_at: v.ends_at ? localInputToIso(v.ends_at) : undefined,
              },
              {
                onSuccess: () => {
                  form.reset(empty)
                  onOpenChange(false)
                },
              },
            ),
          )}
        >
          <Field
            label={t('fields.group')}
            required
            error={errors.group_id?.message}
            htmlFor="db-group"
          >
            <Controller
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <GroupSelect
                  id="db-group"
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? '')}
                  invalid={!!errors.group_id}
                />
              )}
            />
          </Field>
          <Field
            label={t('arena.titleField')}
            required
            error={errors.title?.message}
            htmlFor="db-title"
          >
            <Input
              id="db-title"
              placeholder={t('arena.titlePlaceholder')}
              {...form.register('title')}
              aria-invalid={!!errors.title}
            />
          </Field>
          <Field label={t('arena.topic')} required error={errors.topic?.message} htmlFor="db-topic">
            <Textarea
              id="db-topic"
              rows={3}
              placeholder={t('arena.topicPlaceholder')}
              {...form.register('topic')}
              aria-invalid={!!errors.topic}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('arena.startsAt')} htmlFor="db-start">
              <Input id="db-start" type="datetime-local" {...form.register('starts_at')} />
            </Field>
            <Field label={t('arena.endsAt')} error={errors.ends_at?.message} htmlFor="db-end">
              <Input
                id="db-end"
                type="datetime-local"
                {...form.register('ends_at')}
                aria-invalid={!!errors.ends_at}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={create.isPending}>
              {t('arena.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
