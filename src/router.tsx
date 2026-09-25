/* eslint-disable react-refresh/only-export-components -- route table, not a component module */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ListSkeleton } from '@/components/shared/States'
import { FullScreenLoader, RequireAuth, RequireRole } from '@/features/auth/guards'
import type { Role } from '@/types'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const PaymentsPage = lazy(() => import('@/features/payments/PaymentsPage'))
const StudentsPage = lazy(() => import('@/features/students/StudentsPage'))
const TeachersPage = lazy(() => import('@/features/teachers/TeachersPage'))
const ParentsPage = lazy(() => import('@/features/parents/ParentsPage'))
const GroupsPage = lazy(() => import('@/features/groups/GroupsPage'))
const GroupDetailPage = lazy(() => import('@/features/groups/GroupDetailPage'))
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
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: page(<PaymentsPage />) },
      { path: 'students', element: adminOnly(<StudentsPage />) },
      { path: 'teachers', element: adminOnly(<TeachersPage />) },
      { path: 'parents', element: adminOnly(<ParentsPage />) },
      { path: 'groups', element: page(<GroupsPage />) },
      { path: 'groups/:id', element: page(<GroupDetailPage />) },
      { path: 'profile', element: page(<ProfilePage />) },
      { path: 'payments', element: adminOnly(<PaymentsPage />) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
