import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useStudents } from '@/hooks/useStudents'
import { formatPhone } from '@/lib/phone'
import { fullName } from '@/lib/roles'
import { cn } from '@/lib/utils'

export function StudentMultiSelect({
  value,
  onChange,
  id,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  id?: string
}) {
  const { t } = useTranslation()
  const students = useStudents()
  const [q, setQ] = useState('')
  const all = useMemo(() => students.data ?? [], [students.data])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s
      ? all.filter((st) =>
          `${fullName(st)} ${st.phone} ${st.group_name ?? ''}`.toLowerCase().includes(s),
        )
      : all
  }, [all, q])
  const selected = all.filter((s) => value.includes(s.id))
  const toggle = (sid: string) =>
    onChange(value.includes(sid) ? value.filter((x) => x !== sid) : [...value, sid])

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger
          id={id}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-left text-sm font-medium transition-colors data-[state=open]:border-primary data-[state=open]:shadow-[0_0_0_3px_rgba(74,158,237,.15)]"
        >
          <span className={cn(!value.length && 'font-normal text-ink-mute')}>
            {value.length
              ? t('parents.childrenSelected', { count: value.length })
              : t('parents.pickChildren')}
          </span>
          <ChevronDown className="size-4 text-ink-mute" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
          <div className="relative border-b p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('students.search')}
              className="h-9 pl-9"
              autoFocus
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            {students.isLoading && (
              <li className="px-2.5 py-2 text-sm text-ink-mute">{t('common.loading')}</li>
            )}
            {!students.isLoading && filtered.length === 0 && (
              <li className="px-2.5 py-2 text-sm text-ink-mute">{t('states.noResults')}</li>
            )}
            {filtered.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-[9px] px-2.5 py-2 hover:bg-soft">
                  <Checkbox checked={value.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{fullName(s)}</span>
                    <span className="tabular block truncate text-xs text-ink-mute">
                      {formatPhone(s.phone)}
                      {s.group_name ? ` · ${s.group_name}` : ''}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-tint py-1 pl-2.5 pr-1 text-xs font-bold text-tint-foreground"
            >
              {fullName(s)}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="grid size-4 place-items-center rounded-full hover:bg-card"
                aria-label={t('common.delete')}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
