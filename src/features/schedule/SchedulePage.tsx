import { CalendarDays, Video } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/shared/States'
import { Card } from '@/components/ui/card'
import { useVisibleGroups } from '@/hooks/useGroups'
import { fmtTime, now } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Group } from '@/types'

const DAYS = [1, 2, 3, 4, 5, 6, 7]
const HOUR_PX = 56

/** Tints derived from the brand blue→violet range so blocks feel on-brand but distinct. */
const TONES = [
  'bg-[#eef3fe] border-[#4a9eed] text-[#1e4f8a] dark:bg-[#1d2c4a] dark:text-[#b9d7fb]',
  'bg-[#f1ecfe] border-[#8b5cf6] text-[#4c2a9e] dark:bg-[#2a2150] dark:text-[#d6c8fd]',
  'bg-[#e7f7ee] border-[#16a34a] text-[#0f5a2b] dark:bg-[#15321f] dark:text-[#a7e6bf]',
  'bg-[#fdf2e2] border-[#d97706] text-[#7a4205] dark:bg-[#3a2a12] dark:text-[#f6cd8e]',
  'bg-[#e8f4fb] border-[#0891b2] text-[#0b4a5c] dark:bg-[#10313b] dark:text-[#a3dcec]',
  'bg-[#fcebf3] border-[#db2777] text-[#7d1745] dark:bg-[#3b1628] dark:text-[#f5b3d1]',
]

function minutes(v: string): number {
  const [h, m] = fmtTime(v).split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export default function SchedulePage() {
  const { t } = useTranslation()
  const groups = useVisibleGroups()
  const list = useMemo(
    () => (groups.data ?? []).filter((g) => g.start_time && g.end_time),
    [groups.data],
  )
  const tone = useMemo(() => new Map(list.map((g, i) => [g.id, TONES[i % TONES.length]])), [list])
  const today = now().isoWeekday()
  const nowMin = now().hour() * 60 + now().minute()

  const [startH, endH] = useMemo(() => {
    if (!list.length) return [8, 20]
    const s = Math.min(...list.map((g) => minutes(g.start_time)))
    const e = Math.max(...list.map((g) => minutes(g.end_time)))
    return [Math.max(0, Math.floor(s / 60) - 1), Math.min(24, Math.ceil(e / 60) + 1)]
  }, [list])
  const hours = Array.from({ length: endH - startH }, (_, i) => startH + i)

  const byDay = (d: number) =>
    list
      .filter((g) => g.days_of_week.includes(d))
      .sort((a, b) => minutes(a.start_time) - minutes(b.start_time))

  return (
    <>
      <PageHeader title={t('nav.schedule')} description={t('schedule.subtitle')} />
      {groups.isLoading ? (
        <Card>
          <ListSkeleton />
        </Card>
      ) : groups.error ? (
        <Card>
          <ErrorState error={groups.error} onRetry={() => void groups.refetch()} />
        </Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title={t('schedule.empty')}
            description={t('schedule.emptyHint')}
          />
        </Card>
      ) : (
        <>
          {/* Desktop week grid */}
          <Card className="hidden overflow-hidden md:block">
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b bg-soft">
              <div />
              {DAYS.map((d) => (
                <div
                  key={d}
                  className={cn(
                    'border-l px-2 py-3 text-center text-sm font-bold',
                    d === today && 'text-tint-foreground',
                  )}
                >
                  <span className="hidden lg:inline">{t(`weekdays.long.${d}`)}</span>
                  <span className="lg:hidden">{t(`weekdays.short.${d}`)}</span>
                  {d === today && (
                    <span className="mx-auto mt-1 block h-1 w-6 rounded-full bg-brand" />
                  )}
                </div>
              ))}
            </div>
            <div
              className="relative grid grid-cols-[56px_repeat(7,minmax(0,1fr))]"
              style={{ height: hours.length * HOUR_PX }}
            >
              <div>
                {hours.map((h) => (
                  <div
                    key={h}
                    className="tabular relative text-right text-xs font-semibold text-ink-mute"
                    style={{ height: HOUR_PX }}
                  >
                    <span className="absolute -top-2 right-2">{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
              {DAYS.map((d) => (
                <div key={d} className={cn('relative border-l', d === today && 'bg-tint/30')}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="border-t border-dashed border-border/70"
                      style={{ height: HOUR_PX }}
                    />
                  ))}
                  {d === today && nowMin >= startH * 60 && nowMin <= endH * 60 && (
                    <div
                      className="absolute inset-x-0 z-10 h-0.5 bg-bad"
                      style={{ top: ((nowMin - startH * 60) / 60) * HOUR_PX }}
                    >
                      <span className="absolute -left-1 -top-1 size-2.5 rounded-full bg-bad" />
                    </div>
                  )}
                  {byDay(d).map((g) => (
                    <Block key={g.id} group={g} tone={tone.get(g.id) ?? TONES[0]} startH={startH} />
                  ))}
                </div>
              ))}
            </div>
          </Card>

          {/* Mobile agenda */}
          <div className="grid gap-4 md:hidden">
            {DAYS.map((d) => {
              const items = byDay(d)
              return (
                <Card key={d} className={cn('p-4', d === today && 'border-primary')}>
                  <p className="mb-3 font-bold">
                    {t(`weekdays.long.${d}`)}
                    {d === today && (
                      <span className="ml-2 text-xs font-bold text-tint-foreground">
                        {t('groups.today')}
                      </span>
                    )}
                  </p>
                  {items.length === 0 ? (
                    <p className="text-sm text-ink-mute">{t('schedule.free')}</p>
                  ) : (
                    <ul className="grid gap-2">
                      {items.map((g) => (
                        <li key={g.id}>
                          <Link
                            to={`/groups/${g.id}`}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border-l-4 px-3 py-2',
                              tone.get(g.id),
                            )}
                          >
                            <span className="tabular text-sm font-extrabold">
                              {fmtTime(g.start_time)}–{fmtTime(g.end_time)}
                            </span>
                            <span className="truncate font-semibold">{g.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

function Block({ group: g, tone, startH }: { group: Group; tone: string; startH: number }) {
  const top = ((minutes(g.start_time) - startH * 60) / 60) * HOUR_PX
  const height = Math.max(28, ((minutes(g.end_time) - minutes(g.start_time)) / 60) * HOUR_PX - 4)
  return (
    <Link
      to={`/groups/${g.id}`}
      title={`${g.name} · ${fmtTime(g.start_time)}–${fmtTime(g.end_time)}`}
      className={cn(
        'absolute inset-x-1 z-[5] overflow-hidden rounded-md border-l-[3px] px-2 py-1.5 text-xs transition-shadow hover:z-20 hover:shadow-lift',
        tone,
      )}
      style={{ top: top + 2, height }}
    >
      <p className="truncate font-bold">{g.name}</p>
      <p className="tabular flex items-center gap-1 font-semibold opacity-80">
        {fmtTime(g.start_time)}–{fmtTime(g.end_time)} {g.online_url && <Video className="size-3" />}
      </p>
      {g.teacher_name && height > 60 && <p className="truncate opacity-70">{g.teacher_name}</p>}
    </Link>
  )
}
