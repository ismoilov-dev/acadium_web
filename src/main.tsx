import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import 'leaflet/dist/leaflet.css'

import { ApiError } from '@/api/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import i18n from '@/i18n'
import { errorMessage } from '@/lib/errors'
import { applyStoredTheme } from '@/lib/theme'
import { router } from '@/router'

import './index.css'

applyStoredTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err) =>
        !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
    },
  },
  queryCache: new QueryCache({
    // Background refetch failures surface as a toast; first-load errors render inline.
    onError: (err, query) => {
      if (query.state.data !== undefined) toast.error(errorMessage(err, i18n.t))
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ style: { fontFamily: 'Manrope, sans-serif' } }}
          />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
