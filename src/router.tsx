import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { ListSkeleton } from '@/components/shared/States'
import { FullScreenLoader, RequireAuth, RequireRole } from '@/features/auth/guards'
import type { Role } from '@/types'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const PaymentsPage = lazy(() => import('@/features/payments/PaymentsPage'))

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
      { path: 'payments', element: adminOnly(<PaymentsPage />) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
