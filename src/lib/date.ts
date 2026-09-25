import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import 'dayjs/locale/uz-latn'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)

export const TZ = 'Asia/Tashkent'
dayjs.tz.setDefault(TZ)

export function setDateLocale(lang: string) {
  dayjs.locale(lang === 'uz' ? 'uz-latn' : lang)
}

/** Parse an API timestamp and view it in Tashkent time. */
export function tz(value?: string | number | Date | null) {
  return value ? dayjs(value).tz(TZ) : dayjs().tz(TZ)
}

export function now() {
  return dayjs().tz(TZ)
}

export function fmtDate(value?: string | null): string {
  return value ? tz(value).format('DD.MM.YYYY') : '—'
}

export function fmtDateTime(value?: string | null): string {
  return value ? tz(value).format('DD.MM.YYYY, HH:mm') : '—'
}

export function fmtTime(value?: string | null): string {
  if (!value) return '—'
  // "18:00" / "18:00:00" come as plain wall-clock times.
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  return tz(value).format('HH:mm')
}

export function fromNow(value?: string | null): string {
  return value ? tz(value).fromNow() : '—'
}

/** Today's ISO weekday in Tashkent: 1 = Monday … 7 = Sunday. */
export function todayWeekday(): number {
  return now().isoWeekday()
}

/** `<input type="datetime-local">` value (Tashkent wall time) → ISO string with offset. */
export function localInputToIso(value: string): string {
  return dayjs.tz(value, 'YYYY-MM-DDTHH:mm', TZ).format()
}

/** ISO → `<input type="datetime-local">` value in Tashkent wall time. */
export function isoToLocalInput(value?: string | null): string {
  return value ? tz(value).format('YYYY-MM-DDTHH:mm') : ''
}

export { dayjs }
