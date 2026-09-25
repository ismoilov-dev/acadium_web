import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { EmptyState, ErrorState, ListSkeleton } from './States'

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number | null | undefined
  className?: string
  headClassName?: string
}

interface Props<T> {
  data: T[] | undefined
  columns: Column<T>[]
  rowKey: (row: T) => string
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  searchText?: (row: T) => string
  searchPlaceholder?: string
  toolbar?: ReactNode
  onRowClick?: (row: T) => void
  empty?: ReactNode
  pageSize?: number
  initialSort?: { id: string; desc?: boolean }
}

const collator = new Intl.Collator(['uz', 'ru', 'en'], { numeric: true, sensitivity: 'base' })

/** Client-side search / sort / pagination table (the API has no server paging yet). */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  searchText,
  searchPlaceholder,
  toolbar,
  onRowClick,
  empty,
  pageSize = 12,
  initialSort,
}: Props<T>) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(0)

  const rows = useMemo(() => {
    let list = data ?? []
    const q = query.trim().toLowerCase()
    if (q && searchText) list = list.filter((r) => searchText(r).toLowerCase().includes(q))
    const col = sort && columns.find((c) => c.id === sort.id)
    if (col?.sortValue) {
      const get = col.sortValue
      list = [...list].sort((a, b) => {
        const va = get(a)
        const vb = get(b)
        if (va == null && vb == null) return 0
        if (va == null) return 1
        if (vb == null) return -1
        const r =
          typeof va === 'number' && typeof vb === 'number'
            ? va - vb
            : collator.compare(String(va), String(vb))
        return sort?.desc ? -r : r
      })
    }
    return list
  }, [data, query, searchText, sort, columns])

  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * pageSize, current * pageSize + pageSize)

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id !== id ? { id } : s.desc ? undefined : { id, desc: true }))

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          {searchText && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder ?? t('common.search')}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : loading ? (
        <ListSkeleton />
      ) : rows.length === 0 ? (
        query ? (
          <EmptyState
            icon={Search}
            title={t('states.noResults')}
            description={t('states.noResultsHint')}
          />
        ) : (
          (empty ?? <EmptyState title={t('states.empty')} />)
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.id} className={c.headClassName}>
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="inline-flex items-center gap-1 uppercase hover:text-foreground"
                    >
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.desc ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUp className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((c) => (
                  <TableCell key={c.id} className={c.className}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && !error && rows.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-ink-soft">
          <span className="tabular">
            {t('table.range', {
              from: current * pageSize + 1,
              to: Math.min(rows.length, (current + 1) * pageSize),
              total: rows.length,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label={t('table.prev')}
            >
              <ChevronLeft />
            </Button>
            <span className="tabular min-w-14 text-center font-semibold">
              {current + 1} / {pages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              aria-label={t('table.next')}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
