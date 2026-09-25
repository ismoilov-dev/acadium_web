import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authApi } from '@/api/auth'
import { setUnauthorizedHandler } from '@/api/client'
import { tokenStore } from '@/lib/storage'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | undefined
  loading: boolean
  error: unknown
  signIn: (token: string) => void
  signOut: () => Promise<void>
  refetchUser: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  const me = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: authApi.me,
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  })

  const clear = useCallback(() => {
    tokenStore.clear()
    setToken(null)
    qc.clear()
  }, [qc])

  useEffect(() => {
    setUnauthorizedHandler(clear)
    return () => setUnauthorizedHandler(null)
  }, [clear])

  const signIn = useCallback((next: string) => {
    tokenStore.set(next)
    setToken(next)
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* the session is cleared locally regardless */
    }
    clear()
  }, [clear])

  const value = useMemo<AuthState>(
    () => ({
      token,
      user: me.data,
      loading: !!token && me.isPending,
      error: me.error,
      signIn,
      signOut,
      refetchUser: () => void me.refetch(),
    }),
    [token, me, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
