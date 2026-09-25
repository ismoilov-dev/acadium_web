import { Clock, GraduationCap, Plus, UserRound, Users, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { CardsSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { WeekdayList } from '@/components/shared/WeekdayPicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useVisibleGroups } from '@/hooks/useGroups'
import { useStudents } from '@/hooks/useStudents'
import { fmtTime, todayWeekday } from '@/lib/date'
import { isAdmin } from '@/lib/roles'
import type { Group } from '@/types'

import { GroupFormDialog } from './GroupFormDialog'

export default function GroupsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const admin = isAdmin(user)
  const groups = useVisibleGroups()
  const students = useStudents()
  const [creating, setCreating] = useState(false)
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of students.data ?? [])
      if (s.group_id) m.set(s.group_id, (m.get(s.group_id) ?? 0) + 1)
    return m
  }, [students.data])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    const all = groups.data ?? []
    return s
      ? all.filter((g) =>
          `${g.name} ${g.description ?? ''} ${g.teacher_name ?? ''}`.toLowerCase().includes(s),
        )
      : all
  }, [groups.data, q])

  return (
    <>
      <PageHeader
        title={admin ? t('nav.groups') : t('nav.myGroups')}
        description={t('groups.subtitle', { count: groups.data?.length ?? 0 })}
        actions={
          admin && (
            <Button onClick={() => setCreating(true)}>
              <Plus /> {t('groups.create')}
            </Button>
          )
        }
      />
      {(groups.data?.length ?? 0) > 6 && (
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('common.search')}
          className="mb-4 max-w-xs"
        />
      )}
      {groups.isLoading ? (
        <CardsSkeleton count={6} className="xl:grid-cols-3" />
      ) : groups.error ? (
        <div className="rounded-xl border bg-card">
          <ErrorState error={groups.error} onRetry={() => void groups.refetch()} />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={Users}
            title={q ? t('states.noResults') : t('groups.empty')}
            description={admin ? t('groups.emptyHint') : t('groups.emptyTeacher')}
            action={
              admin &&
              !q && (
                <Button onClick={() => setCreating(true)}>
                  <Plus /> {t('groups.create')}
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => (
            <GroupCard key={g.id} group={g} count={g.student_count ?? counts.get(g.id) ?? 0} />
          ))}
        </div>
      )}
      {admin && <GroupFormDialog open={creating} onOpenChange={setCreating} />}
    </>
  )
}

function GroupCard({ group: g, count }: { group: Group; count: number }) {
  const { t } = useTranslation()
  const today = g.days_of_week.includes(todayWeekday())
  return (
    <Link
      to={`/groups/${g.id}`}
      className="group flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-tint text-sm font-extrabold text-tint-foreground transition-colors group-hover:bg-brand group-hover:text-white">
          {g.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.05rem] font-bold">{g.name}</p>
          <p className="tabular flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <Clock className="size-3.5" /> {fmtTime(g.start_time)}–{fmtTime(g.end_time)}
          </p>
        </div>
        {today && <Badge variant="ok">{t('groups.today')}</Badge>}
      </div>
      {g.description && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{g.description}</p>}
      <WeekdayList days={g.days_of_week} className="mt-4" />
      <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm font-semibold text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="size-4 text-ink-mute" /> {t('groups.studentsCount', { count })}
        </span>
        {g.teacher_name && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <UserRound className="size-4 shrink-0 text-ink-mute" />{' '}
            <span className="truncate">{g.teacher_name}</span>
          </span>
        )}
        {g.online_url && (
          <Video className="ml-auto size-4 text-primary" aria-label={t('groups.online')} />
        )}
      </div>
    </Link>
  )
}
