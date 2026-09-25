import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { DataTable, type Column } from '@/components/shared/DataTable'
import { Field } from '@/components/shared/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { PersonCell } from '@/components/shared/PersonCell'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { EmptyState } from '@/components/shared/States'
import { UserStatusBadge } from '@/components/shared/StatusBadge'
import { StudentMultiSelect } from '@/components/shared/StudentMultiSelect'
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
import { useAddParent, useMembers } from '@/hooks/useCenter'
import { fmtDate } from '@/lib/date'
import { formatPhone, toApiPhone } from '@/lib/phone'
import { fullName } from '@/lib/roles'
import { phoneField, requiredText } from '@/lib/schemas'
import type { Member } from '@/types'

export default function ParentsPage() {
  const { t } = useTranslation()
  const parents = useMembers('PARENT')
  const [adding, setAdding] = useState(false)

  const columns: Column<Member>[] = [
    {
      id: 'name',
      header: t('fields.name'),
      cell: (p) => <PersonCell person={p} />,
      sortValue: (p) => fullName(p),
    },
    {
      id: 'phone',
      header: t('fields.phone'),
      cell: (p) => (
        <span className="tabular whitespace-nowrap font-medium">{formatPhone(p.phone)}</span>
      ),
      headClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell',
    },
    {
      id: 'status',
      header: t('fields.status'),
      cell: (p) => <UserStatusBadge status={p.status} />,
    },
    {
      id: 'created',
      header: t('fields.createdAt'),
      cell: (p) => <span className="tabular text-ink-soft">{fmtDate(p.created_at)}</span>,
      sortValue: (p) => p.created_at ?? '',
      headClassName: 'hidden sm:table-cell',
      className: 'hidden sm:table-cell',
    },
  ]

  return (
    <>
      <PageHeader
        title={t('nav.parents')}
        description={t('parents.subtitle', { count: parents.data?.length ?? 0 })}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus /> {t('parents.add')}
          </Button>
        }
      />
      <DataTable
        data={parents.data}
        columns={columns}
        rowKey={(p) => p.id}
        loading={parents.isLoading}
        error={parents.error}
        onRetry={() => void parents.refetch()}
        searchText={(p) => `${fullName(p)} ${p.phone}`}
        initialSort={{ id: 'name' }}
        empty={
          <EmptyState
            icon={UsersRound}
            title={t('parents.empty')}
            description={t('parents.emptyHint')}
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus /> {t('parents.add')}
              </Button>
            }
          />
        }
      />
      <AddParentDialog open={adding} onOpenChange={setAdding} />
    </>
  )
}

function AddParentDialog({
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
    student_ids: z.array(z.string()),
  })
  type Values = z.infer<typeof schema>
  const empty: Values = { phone: '', first_name: '', last_name: '', student_ids: [] }
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty })
  const add = useAddParent()
  const { errors } = form.formState

  const submit = form.handleSubmit((v) =>
    add.mutate(
      {
        phone: toApiPhone(v.phone),
        first_name: v.first_name.trim(),
        last_name: v.last_name.trim() || undefined,
        student_ids: v.student_ids,
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
          <DialogTitle>{t('parents.add')}</DialogTitle>
          <DialogDescription>{t('parents.addHint')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <Field
            label={t('fields.phone')}
            required
            error={errors.phone?.message}
            htmlFor="pr-phone"
          >
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="pr-phone"
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
              htmlFor="pr-fn"
            >
              <Input
                id="pr-fn"
                {...form.register('first_name')}
                aria-invalid={!!errors.first_name}
              />
            </Field>
            <Field label={t('fields.lastName')} htmlFor="pr-ln">
              <Input id="pr-ln" {...form.register('last_name')} />
            </Field>
          </div>
          <Field
            label={t('parents.children')}
            htmlFor="pr-children"
            hint={t('parents.childrenHint')}
          >
            <Controller
              control={form.control}
              name="student_ids"
              render={({ field }) => (
                <StudentMultiSelect
                  id="pr-children"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={add.isPending}>
              {t('parents.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
