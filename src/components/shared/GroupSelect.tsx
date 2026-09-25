import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVisibleGroups } from '@/hooks/useGroups'
import { fmtTime } from '@/lib/date'

const NONE = '__none__'

/** Group picker backed by the caller's visible groups. `allowNone` adds a "no group" / "all" option. */
export function GroupSelect({
  value,
  onChange,
  allowNone,
  noneLabel,
  placeholder,
  id,
  invalid,
  className,
  disabled,
}: {
  value?: string
  onChange: (id: string | undefined) => void
  allowNone?: boolean
  noneLabel?: string
  placeholder?: string
  id?: string
  invalid?: boolean
  className?: string
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const groups = useVisibleGroups()
  return (
    <Select
      value={value ?? (allowNone ? NONE : '')}
      onValueChange={(v) => onChange(v === NONE ? undefined : v)}
      disabled={disabled || groups.isLoading}
    >
      <SelectTrigger id={id} aria-invalid={invalid} className={invalid ? 'border-bad' : className}>
        <SelectValue
          placeholder={groups.isLoading ? t('common.loading') : (placeholder ?? t('groups.pick'))}
        />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value={NONE}>{noneLabel ?? t('groups.noGroup')}</SelectItem>}
        {(groups.data ?? []).map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.name}
            {g.start_time && (
              <span className="tabular ml-2 text-xs text-ink-mute">
                {fmtTime(g.start_time)}–{fmtTime(g.end_time)}
              </span>
            )}
          </SelectItem>
        ))}
        {!groups.isLoading && (groups.data ?? []).length === 0 && (
          <div className="px-2.5 py-2 text-sm text-ink-mute">{t('groups.empty')}</div>
        )}
      </SelectContent>
    </Select>
  )
}
