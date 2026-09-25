export type Role = 'SUPER_ADMIN' | 'CENTER_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: string
  phone: string
  first_name: string
  last_name?: string
  role: Role
  center_id?: string
  status?: string
  avatar_url?: string
  created_at?: string
}

export type LoginResult =
  | { is_trusted: true; token: string; user?: User }
  | { is_trusted: false; message?: string; request_id?: string }

export interface Center {
  id: string
  name: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  attendance_radius_meters?: number
  logo_url?: string
  created_at?: string
}

/** Any row from GET /centers/me/members. */
export interface Member {
  id: string
  user_id: string
  phone: string
  first_name: string
  last_name?: string
  role: Role
  status?: string
  created_at?: string
}

export interface Student {
  id: string
  user_id?: string
  phone: string
  first_name: string
  last_name?: string
  group_id?: string
  group_name?: string
  status?: string
  avatar_url?: string
  created_at?: string
  parents: Member[]
  grades: Grade[]
  attendance: AttendanceRecord[]
}

export interface Teacher {
  id: string
  user_id?: string
  phone: string
  first_name: string
  last_name?: string
  specialization?: string
  avatar_url?: string
  status?: string
  created_at?: string
  groups: Group[]
}

export interface Group {
  id: string
  name: string
  description?: string
  days_of_week: number[]
  start_time: string
  end_time: string
  online_url?: string
  teacher_id?: string
  teacher_name?: string
  student_count?: number
  students: Student[]
  created_at?: string
}

export interface Homework {
  id: string
  group_id: string
  group_name?: string
  title: string
  description?: string
  deadline?: string
  file_url?: string
  created_at?: string
}

export interface Grade {
  id: string
  student_id: string
  student_name?: string
  homework_id?: string
  homework_title?: string
  score: number
  comment?: string
  created_at?: string
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'UNKNOWN'

export interface AttendanceRecord {
  id: string
  student_id?: string
  student_name?: string
  group_id?: string
  group_name?: string
  date?: string
  check_in_at?: string
  status: AttendanceStatus
}

export interface AttendanceSummary {
  present: number
  late: number
  absent: number
  total?: number
  records: AttendanceRecord[]
}

export interface TeacherDashboard {
  teacher?: Teacher
  groups: Group[]
  homework: Homework[]
  attendance?: AttendanceSummary
}

export interface Debate {
  id: string
  group_id: string
  group_name?: string
  title: string
  topic: string
  starts_at?: string
  ends_at?: string
  status?: string
  participants_count?: number
  created_at?: string
}

export interface ArenaMessage {
  type: string
  sender_id?: string
  sender_name?: string
  content: string
  timestamp?: string
}

export interface AppNotification {
  id: string
  type?: string
  title: string
  body?: string
  is_read: boolean
  created_at?: string
}

export interface Device {
  id: string
  device_id?: string
  device_name?: string
  platform?: string
  is_trusted?: boolean
  last_login_at?: string
  created_at?: string
}

export interface DeviceRequest {
  id: string
  device_id?: string
  device_name?: string
  platform?: string
  status?: string
  created_at?: string
}
