import { arrOf, bool, isRec, list, num, numArr, rec, str, type Rec } from '@/lib/normalize'
import type {
  AppNotification,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  Center,
  Debate,
  Device,
  DeviceRequest,
  Grade,
  Group,
  Homework,
  Member,
  Role,
  Student,
  Teacher,
  TeacherDashboard,
  User,
} from '@/types'

const ROLES: Role[] = ['SUPER_ADMIN', 'CENTER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

function role(v?: string): Role {
  const up = (v ?? '').toUpperCase() as Role
  return ROLES.includes(up) ? up : 'STUDENT'
}

function joinName(o: Rec, key: string): string | undefined {
  const inner = o[key]
  if (!isRec(inner)) return undefined
  const n = [str(inner, 'first_name'), str(inner, 'last_name')].filter(Boolean).join(' ')
  return n || str(inner, ['name', 'full_name'])
}

export function parseUser(v: unknown): User {
  const o = rec(v)
  return {
    id: str(o, ['id', 'user_id']) ?? '',
    phone: str(o, 'phone') ?? '',
    first_name: str(o, 'first_name') ?? str(o, ['name', 'full_name']) ?? '',
    last_name: str(o, 'last_name'),
    role: role(str(o, 'role')),
    center_id: str(o, 'center_id'),
    status: str(o, 'status'),
    avatar_url: str(o, 'avatar_url'),
    created_at: str(o, 'created_at'),
  }
}

export function parseCenter(v: unknown): Center {
  const o = rec(isRec(v) && isRec(v.center) ? v.center : v)
  return {
    id: str(o, 'id', []) ?? '',
    name: str(o, 'name', []) ?? '',
    phone: str(o, 'phone', []),
    address: str(o, 'address', []),
    latitude: num(o, 'latitude', []),
    longitude: num(o, 'longitude', []),
    attendance_radius_meters: num(o, 'attendance_radius_meters', []),
    logo_url: str(o, 'logo_url', []),
    created_at: str(o, 'created_at', []),
  }
}

export function parseMember(v: unknown): Member {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? str(o, ['user_id', 'id']) ?? '',
    user_id: str(o, 'user_id') ?? str(o, 'id') ?? '',
    phone: str(o, 'phone') ?? '',
    first_name: str(o, 'first_name') ?? '',
    last_name: str(o, 'last_name'),
    role: role(str(o, 'role')),
    status: str(o, 'status'),
    created_at: str(o, 'created_at'),
  }
}

export function parseGroup(v: unknown): Group {
  const o = rec(isRec(v) && isRec(v.group) ? v.group : v)
  const students = arrOf(o, ['students', 'members']).map(parseStudent)
  return {
    id: str(o, 'id', []) ?? '',
    name: str(o, 'name', []) ?? '',
    description: str(o, 'description', []),
    days_of_week: numArr(o, 'days_of_week'),
    start_time: str(o, 'start_time', []) ?? '',
    end_time: str(o, 'end_time', []) ?? '',
    online_url: str(o, 'online_url', []),
    teacher_id: str(o, 'teacher_id', []),
    teacher_name: str(o, 'teacher_name', []) ?? joinName(o, 'teacher'),
    student_count:
      num(o, ['student_count', 'students_count'], []) ?? (students.length || undefined),
    students,
    created_at: str(o, 'created_at', []),
  }
}

export function parseStudent(v: unknown): Student {
  const o = rec(v)
  const group = isRec(o.group) ? o.group : undefined
  return {
    id: str(o, 'id', []) ?? str(o, ['student_id', 'id']) ?? '',
    user_id: str(o, 'user_id'),
    phone: str(o, 'phone') ?? '',
    first_name: str(o, 'first_name') ?? '',
    last_name: str(o, 'last_name'),
    group_id: str(o, 'group_id', []) ?? (group && str(group, 'id', [])),
    group_name: str(o, 'group_name', []) ?? (group && str(group, 'name', [])),
    status: str(o, 'status'),
    avatar_url: str(o, 'avatar_url'),
    created_at: str(o, 'created_at', []),
    parents: arrOf(o, 'parents').map(parseMember),
    grades: arrOf(o, 'grades').map(parseGrade),
    attendance: arrOf(o, 'attendance').map(parseAttendanceRecord),
  }
}

export function parseTeacher(v: unknown): Teacher {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? str(o, ['teacher_id', 'id']) ?? '',
    user_id: str(o, 'user_id'),
    phone: str(o, 'phone') ?? '',
    first_name: str(o, 'first_name') ?? '',
    last_name: str(o, 'last_name'),
    specialization: str(o, 'specialization'),
    avatar_url: str(o, 'avatar_url'),
    status: str(o, 'status'),
    created_at: str(o, 'created_at', []),
    groups: arrOf(o, 'groups').map(parseGroup),
  }
}

export function parseHomework(v: unknown): Homework {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    group_id: str(o, 'group_id', []) ?? '',
    group_name: str(o, 'group_name', []) ?? (isRec(o.group) ? str(o.group, 'name', []) : undefined),
    title: str(o, 'title', []) ?? '',
    description: str(o, 'description', []),
    deadline: str(o, ['deadline', 'due_date'], []),
    file_url: str(o, 'file_url', []),
    created_at: str(o, 'created_at', []),
  }
}

export function parseGrade(v: unknown): Grade {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    student_id: str(o, 'student_id', []) ?? '',
    student_name: str(o, 'student_name', []) ?? joinName(o, 'student'),
    homework_id: str(o, 'homework_id', []),
    homework_title:
      str(o, 'homework_title', []) ??
      (isRec(o.homework) ? str(o.homework, 'title', []) : undefined),
    score: num(o, ['score', 'value'], []) ?? 0,
    comment: str(o, 'comment', []),
    created_at: str(o, 'created_at', []),
  }
}

function attendanceStatus(v?: string): AttendanceStatus {
  const s = (v ?? '').toUpperCase()
  if (s === 'PRESENT' || s === 'LATE' || s === 'ABSENT') return s
  return 'UNKNOWN'
}

export function parseAttendanceRecord(v: unknown): AttendanceRecord {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    student_id: str(o, 'student_id', []),
    student_name: str(o, 'student_name', []) ?? joinName(o, 'student'),
    group_id: str(o, 'group_id', []),
    group_name: str(o, 'group_name', []) ?? (isRec(o.group) ? str(o.group, 'name', []) : undefined),
    date: str(o, ['date', 'lesson_date'], []),
    check_in_at: str(o, ['check_in_at', 'check_in_time', 'checked_in_at', 'created_at'], []),
    status: attendanceStatus(str(o, 'status', [])),
  }
}

/** Accepts either a plain list of records or a summary object with counters. */
export function parseAttendance(v: unknown): AttendanceSummary {
  const records = list(v, ['records', 'attendance', 'items', 'data', 'list']).map(
    parseAttendanceRecord,
  )
  const o = rec(v)
  const count = (s: AttendanceStatus) => records.filter((r) => r.status === s).length
  return {
    present: num(o, ['present', 'present_count'], []) ?? count('PRESENT'),
    late: num(o, ['late', 'late_count'], []) ?? count('LATE'),
    absent: num(o, ['absent', 'absent_count'], []) ?? count('ABSENT'),
    total: num(o, ['total', 'total_students'], []),
    records,
  }
}

export function parseTeacherDashboard(v: unknown): TeacherDashboard {
  const o = rec(v)
  const att = o.attendance ?? o.today_attendance
  return {
    teacher:
      isRec(o.teacher) || isRec(o.profile) ? parseTeacher(o.teacher ?? o.profile) : undefined,
    groups: arrOf(o, ['groups', 'assigned_groups']).map(parseGroup),
    homework: arrOf(o, ['homework', 'homeworks', 'recent_homework']).map(parseHomework),
    attendance: att !== undefined && att !== null ? parseAttendance(att) : undefined,
  }
}

export function parseDebate(v: unknown): Debate {
  const o = rec(isRec(v) && isRec(v.debate) ? v.debate : v)
  return {
    id: str(o, 'id', []) ?? '',
    group_id: str(o, 'group_id', []) ?? '',
    group_name: str(o, 'group_name', []),
    title: str(o, 'title', []) ?? '',
    topic: str(o, 'topic', []) ?? '',
    starts_at: str(o, 'starts_at', []),
    ends_at: str(o, 'ends_at', []),
    status: str(o, 'status', []),
    participants_count:
      num(o, ['participants_count', 'participant_count'], []) ??
      (arrOf(o, 'participants').length || undefined),
    created_at: str(o, 'created_at', []),
  }
}

export function parseNotification(v: unknown): AppNotification {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    type: str(o, 'type', []),
    title: str(o, 'title', []) ?? '',
    body: str(o, ['body', 'message'], []),
    is_read: bool(o, ['is_read', 'read']) ?? !!str(o, 'read_at', []),
    created_at: str(o, 'created_at', []),
  }
}

export function parseDevice(v: unknown): Device {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    device_id: str(o, 'device_id', []),
    device_name: str(o, 'device_name', []),
    platform: str(o, 'platform', []),
    is_trusted: bool(o, 'is_trusted'),
    last_login_at: str(o, ['last_login_at', 'last_seen_at', 'updated_at'], []),
    created_at: str(o, 'created_at', []),
  }
}

export function parseDeviceRequest(v: unknown): DeviceRequest {
  const o = rec(v)
  return {
    id: str(o, 'id', []) ?? '',
    device_id: str(o, 'device_id', []),
    device_name: str(o, 'device_name', []),
    platform: str(o, 'platform', []),
    status: str(o, 'status', []),
    created_at: str(o, 'created_at', []),
  }
}

export const listOf =
  <T>(parse: (v: unknown) => T) =>
  (v: unknown): T[] =>
    list(v).map(parse)
