import { BookOpenCheck, CalendarClock, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/States'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useVisibleGroups } from '@/hooks/useGroups'
import { useDeleteHomework, useHomeworkList } from '@/hooks/useHomework'
import { fmtDateTime, fromNow } from '@/lib/date'
import { homeworkState } from '@/lib/homework'
import type { Homework } from '@/types'

import { HomeworkFormDialog } from './HomeworkFormDialog'
import { HomeworkStateBadge } from './HomeworkStateBadge'

type Filter = 'all' | 'active' | 'overdue'

export default function HomeworkPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [groupId, setGroupId] = useState<string | undefined>(params.get('group') ?? undefined)
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Homework>()
  const [deleting, setDeleting] = useState<Homework>()
  const creating = params.get('new') === '1'
  const hw = useHomeworkList(groupId)
  const groups = useVisibleGroups()
  const del = useDeleteHomework()

  const groupName = useMemo(() => {
    const m = new Map((groups.data ?? []).map((g) => [g.id, g.name]))
    return (h: Homework) => h.group_name ?? m.get(h.group_id) ?? '—'
  }, [groups.data])

  const data = useMemo(() => {
    const visibleGroups = new Set((groups.data ?? []).map((g) => g.id))
    return (hw.data ?? [])
      .filter((h) => !groups.data || visibleGroups.has(h.group_id) || !!h.group_name)
      .filter((h) => {
        const s = homeworkState(h)
        if (filter === 'active') return s === 'active' || s === 'soon' || s === 'none'
        if (filter === 'overdue') return s === 'overdue'
        return true
      })
  }, [hw.data, filter, groups.data])

  const setCreating = (open: boolean) => {
    const next = new URLSearchParams(params)
    if (open) next.set('new', '1')
    else next.delete('new')
    setParams(next, { replace: true })
  }

  const columns: Column<Homework>[] = [
    {
      id: 'title',
      header: t('homework.title'),
      sortValue: (h) => h.title,
      cell: (h) => (
        <div className="min-w-0 max-w-md">
          <p className="flex items-center gap-1.5 truncate font-bold">
            {h.title} {h.file_url && <Paperclip className="size-3.5 shrink-0 text-ink-mute" />}
          </p>
          {h.description && <p className="truncate text-xs text-ink-soft">{h.description}</p>}
        </div>
      ),
    },
    {
      id: 'group',
      header: t('fields.group'),
      cell: (h) => <Badge>{groupName(h)}</Badge>,
      sortValue: groupName,
    },
    {
      id: 'deadline',
      header: t('homework.deadline'),
      sortValue: (h) => h.deadline ?? '',
      cell: (h) => (
        <div className="whitespace-nowrap">
          <p className="tabular font-semibold">{fmtDateTime(h.deadline)}</p>
          {h.deadline && <p className="text-xs text-ink-mute">{fromNow(h.deadline)}</p>}
        </div>
      ),
    },
    {
      id: 'state',
      header: t('fields.status'),
      cell: (h) => <HomeworkStateBadge hw={h} />,
      headClassName: 'hidden sm:table-cell',
      className: 'hidden sm:table-cell',
    },
    {
      id: 'actions',
      header: '',
      className: 'w-24 text-right',
      cell: (h) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('common.edit')}
            onClick={() => setEditing(h)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-bad hover:bg-bad-soft hover:text-bad"
            aria-label={t('common.delete')}
            onClick={() => setDeleting(h)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('nav.homework')}
        description={t('homework.subtitle')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> {t('homework.create')}
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        rowKey={(h) => h.id}
        loading={hw.isLoading}
        error={hw.error}
        onRetry={() => void hw.refetch()}
        searchText={(h) => `${h.title} ${h.description ?? ''} ${groupName(h)}`}
        initialSort={{ id: 'deadline', desc: true }}
        onRowClick={(h) => navigate(`/homework/${h.id}`)}
        toolbar={
          <>
            <div className="w-full sm:w-56">
              <GroupSelect
                value={groupId}
                onChange={setGroupId}
                allowNone
                noneLabel={t('groups.allGroups')}
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                <TabsTrigger value="active">{t('homework.active')}</TabsTrigger>
                <TabsTrigger value="overdue">
                  <CalendarClock /> {t('homework.closed')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
        empty={
          <EmptyState
            icon={BookOpenCheck}
            title={t('homework.empty')}
            description={t('homework.emptyHint')}
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus /> {t('homework.create')}
              </Button>
            }
          />
        }
      />
      <HomeworkFormDialog open={creating} defaultGroupId={groupId} onOpenChange={setCreating} />
      <HomeworkFormDialog
        open={!!editing}
        homework={editing}
        onOpenChange={(o) => !o && setEditing(undefined)}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
        title={t('homework.deleteTitle')}
        description={t('homework.deleteText', { title: deleting?.title ?? '' })}
        loading={del.isPending}
        onConfirm={() =>
          deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(undefined) })
        }
      />
    </>
  )
}
