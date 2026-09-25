import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { errorMessage } from '@/lib/errors'

interface Options<TData, TVars> {
  mutationFn: (vars: TVars) => Promise<TData>
  invalidate?: QueryKey[]
  success?: string | ((data: TData, vars: TVars) => string)
  onSuccess?: (data: TData, vars: TVars) => void
  silentError?: boolean
}

/** useMutation + cache invalidation + success/error toasts. */
export function useApiMutation<TData = unknown, TVars = void>(opts: Options<TData, TVars>) {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation<TData, Error, TVars>({
    mutationFn: opts.mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(
        (opts.invalidate ?? []).map((key) => qc.invalidateQueries({ queryKey: key })),
      )
      const msg = typeof opts.success === 'function' ? opts.success(data, vars) : opts.success
      if (msg) toast.success(msg)
      opts.onSuccess?.(data, vars)
    },
    onError: (err) => {
      if (!opts.silentError) toast.error(errorMessage(err, t))
    },
  })
}
