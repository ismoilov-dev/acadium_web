/* eslint-disable react-refresh/only-export-components -- route table, not a component module */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { TopbarContext } from '@/components/layout/TopbarContext'
import { ListSkeleton } from '@/components/shared/States'
import { FullScreenLoader, RequireAuth, RequireRole } from '@/features/auth/guards'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import type { Role } from '@/types'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const StudentsPage = lazy(() => import('@/features/students/StudentsPage'))
const TeachersPage = lazy(() => import('@/features/teachers/TeachersPage'))
const ParentsPage = lazy(() => import('@/features/parents/ParentsPage'))
const GroupsPage = lazy(() => import('@/features/groups/GroupsPage'))
const GroupDetailPage = lazy(() => import('@/features/groups/GroupDetailPage'))
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage'))
const AttendancePage = lazy(() => import('@/features/attendance/AttendancePage'))
const HomeworkPage = lazy(() => import('@/features/homework/HomeworkPage'))
const HomeworkDetailPage = lazy(() => import('@/features/homework/HomeworkDetailPage'))
const GradesPage = lazy(() => import('@/features/grades/GradesPage'))
const ArenaPage = lazy(() => import('@/features/arena/ArenaPage'))
const DebatePage = lazy(() => import('@/features/arena/DebatePage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const PaymentsPage = lazy(() => import('@/features/payments/PaymentsPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))

const A: Role[] = ['CENTER_ADMIN']

function page(node: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border bg-card">
          <ListSkeleton />
        </div>
      }
    >
      {node}
    </Suspense>
  )
}

const adminOnly = (node: ReactNode) => <RequireRole roles={A}>{page(node)}</RequireRole>

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<FullScreenLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout topbarStart={<TopbarContext />} topbarEnd={<NotificationBell />} />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: page(<DashboardPage />) },
      { path: 'students', element: adminOnly(<StudentsPage />) },
      { path: 'teachers', element: adminOnly(<TeachersPage />) },
      { path: 'parents', element: adminOnly(<ParentsPage />) },
      { path: 'groups', element: page(<GroupsPage />) },
      { path: 'groups/:id', element: page(<GroupDetailPage />) },
      { path: 'schedule', element: page(<SchedulePage />) },
      { path: 'attendance', element: page(<AttendancePage />) },
      { path: 'homework', element: page(<HomeworkPage />) },
      { path: 'homework/:id', element: page(<HomeworkDetailPage />) },
      { path: 'grades', element: page(<GradesPage />) },
      { path: 'arena', element: page(<ArenaPage />) },
      { path: 'arena/:id', element: page(<DebatePage />) },
      { path: 'settings', element: adminOnly(<SettingsPage />) },
      { path: 'payments', element: adminOnly(<PaymentsPage />) },
      { path: 'profile', element: page(<ProfilePage />) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
