import { GraduationCap, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { DataTable, type Column } from '@/components/shared/DataTable'
import { GroupSelect } from '@/components/shared/GroupSelect'
import { PageHeader } from '@/components/shared/PageHeader'
import { PersonCell } from '@/components/shared/PersonCell'
import { EmptyState } from '@/components/shared/States'
import { UserStatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGroups } from '@/hooks/useGroups'
import { useStudents } from '@/hooks/useStudents'
import { fmtDate } from '@/lib/date'
import { formatPhone } from '@/lib/phone'
import { fullName } from '@/lib/roles'
import type { Student } from '@/types'

import { AddStudentDialog } from './AddStudentDialog'
import { StudentDrawer } from './StudentDrawer'

export default function StudentsPage() {
  const { t } = useTranslation()
  const students = useStudents()
  const groups = useGroups()
  const [params, setParams] = useSearchParams()
  const [adding, setAdding] = useState(false)
  const [groupFilter, setGroupFilter] = useState<string>()
  const openId = params.get('id') ?? undefined

  const groupName = useMemo(() => {
    const m = new Map((groups.data ?? []).map((g) => [g.id, g.name]))
    return (s: Student) => s.group_name ?? (s.group_id ? m.get(s.group_id) : undefined)
  }, [groups.data])

  const data = useMemo(
    () => (students.data ?? []).filter((s) => !groupFilter || s.group_id === groupFilter),
    [students.data, groupFilter],
  )

  const columns: Column<Student>[] = [
    {
      id: 'name',
      header: t('fields.name'),
      cell: (s) => <PersonCell person={s} />,
      sortValue: (s) => fullName(s),
    },
    {
      id: 'phone',
      header: t('fields.phone'),
      cell: (s) => (
        <span className="tabular whitespace-nowrap font-medium">{formatPhone(s.phone)}</span>
      ),
      headClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell',
    },
    {
      id: 'group',
      header: t('fields.group'),
      cell: (s) => {
        const g = groupName(s)
        return g ? <Badge>{g}</Badge> : <Badge variant="muted">{t('groups.noGroup')}</Badge>
      },
      sortValue: (s) => groupName(s) ?? '',
    },
    {
      id: 'status',
      header: t('fields.status'),
      cell: (s) => <UserStatusBadge status={s.status} />,
      headClassName: 'hidden sm:table-cell',
      className: 'hidden sm:table-cell',
    },
    {
      id: 'created',
      header: t('fields.createdAt'),
      cell: (s) => <span className="tabular text-ink-soft">{fmtDate(s.created_at)}</span>,
      sortValue: (s) => s.created_at ?? '',
      headClassName: 'hidden lg:table-cell',
      className: 'hidden lg:table-cell',
    },
  ]

  return (
    <>
      <PageHeader
        title={t('nav.students')}
        description={t('students.subtitle', { count: students.data?.length ?? 0 })}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus /> {t('students.add')}
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        rowKey={(s) => s.id}
        loading={students.isLoading}
        error={students.error}
        onRetry={() => void students.refetch()}
        searchText={(s) => `${fullName(s)} ${s.phone} ${groupName(s) ?? ''}`}
        searchPlaceholder={t('students.search')}
        initialSort={{ id: 'name' }}
        onRowClick={(s) => setParams({ id: s.id })}
        toolbar={
          <div className="w-full sm:w-56">
            <GroupSelect
              value={groupFilter}
              onChange={setGroupFilter}
              allowNone
              noneLabel={t('groups.allGroups')}
            />
          </div>
        }
        empty={
          <EmptyState
            icon={GraduationCap}
            title={t('students.empty')}
            description={t('students.emptyHint')}
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus /> {t('students.add')}
              </Button>
            }
          />
        }
      />
      <AddStudentDialog open={adding} onOpenChange={setAdding} />
      <StudentDrawer
        id={openId}
        fallback={students.data?.find((s) => s.id === openId)}
        onClose={() => setParams({})}
      />
    </>
  )
}
