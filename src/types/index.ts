export type Role = 'SUPER_ADMIN' | 'CENTER_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

/** GET /auth/me — refined from the live response in step 3 of the plan. */
export interface User {
  id: string
  phone: string
  first_name: string
  last_name?: string | null
  role: Role
  center_id?: string | null
  status?: string | null
  avatar_url?: string | null
  created_at?: string
}

export type LoginResult =
  | { is_trusted: true; token: string; user?: User }
  | { is_trusted: false; message?: string; request_id?: string }
