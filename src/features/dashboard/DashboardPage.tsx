import { useAuth } from '@/features/auth/AuthProvider'
import { isAdmin } from '@/lib/roles'

import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  return isAdmin(user) ? <AdminDashboard /> : <TeacherDashboard />
}
