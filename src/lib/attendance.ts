import { dayjs, tz, TZ } from './date'
import type { AttendanceRecord, AttendanceSummary, Group, Student } from '@/types'

export interface GroupAttendance {
  group: Group
  expected: number
  present: number
  late: number
  absent: number
}

export interface DayAttendance {
  present: number
  late: number
  absent: number
  expected: number
  /** true when "absent" was derived from schedule − check-ins rather than reported by the API */
  derivedAbsent: boolean
  records: AttendanceRecord[]
  byGroup: GroupAttendance[]
}

export function recordDay(r: AttendanceRecord): string | undefined {
  const v = r.date ?? r.check_in_at
  if (!v) return undefined
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : tz(v).format('YYYY-MM-DD')
}

/**
 * Combines the attendance feed with the schedule: students of groups that meet on `date`
 * and have no check-in are counted as absent (the API records check-ins only).
 */
export function buildDay(
  summary: AttendanceSummary | undefined,
  date: string,
  groups: Group[],
  students: Student[],
): DayAttendance {
  const all = summary?.records ?? []
  const hasDates = all.some((r) => recordDay(r))
  const records = hasDates ? all.filter((r) => recordDay(r) === date) : all
  const weekday = dayjs.tz(date, TZ).isoWeekday()
  const todays = groups.filter((g) => g.days_of_week.includes(weekday))

  const studentGroup = new Map(students.map((s) => [s.id, s.group_id]))
  const byGroup: GroupAttendance[] = todays.map((g) => {
    const members = students.filter((s) => s.group_id === g.id)
    const expected = g.student_count ?? members.length
    const recs = records.filter(
      (r) => (r.group_id ?? (r.student_id ? studentGroup.get(r.student_id) : undefined)) === g.id,
    )
    const present = recs.filter((r) => r.status === 'PRESENT').length
    const late = recs.filter((r) => r.status === 'LATE').length
    const reportedAbsent = recs.filter((r) => r.status === 'ABSENT').length
    return {
      group: g,
      expected,
      present,
      late,
      absent: reportedAbsent || Math.max(0, expected - present - late),
    }
  })

  const count = (s: AttendanceRecord['status']) => records.filter((r) => r.status === s).length
  const present = hasDates ? count('PRESENT') : (summary?.present ?? count('PRESENT'))
  const late = hasDates ? count('LATE') : (summary?.late ?? count('LATE'))
  const reportedAbsent = hasDates ? count('ABSENT') : (summary?.absent ?? count('ABSENT'))
  const expected = byGroup.reduce((a, g) => a + g.expected, 0) || (summary?.total ?? 0)
  const derived = Math.max(0, expected - present - late)
  return {
    present,
    late,
    absent: reportedAbsent || derived,
    expected,
    derivedAbsent: !reportedAbsent && derived > 0,
    records,
    byGroup,
  }
}
