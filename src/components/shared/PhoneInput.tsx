import * as React from 'react'

import { formatLocalPhone, phoneDigits } from '@/lib/phone'
import { cn } from '@/lib/utils'

/** "+998 | 90 123 45 67" — value/onChange work with the 9 local digits. */
export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
    value: string
    onChange: (digits: string) => void
  }
>(({ value, onChange, className, ...props }, ref) => (
  <div
    className={cn(
      'flex h-10 w-full items-center rounded-md border border-input bg-card text-sm font-medium transition-colors focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(74,158,237,.15)] has-[[aria-invalid=true]]:border-bad',
      className,
    )}
  >
    <span className="tabular select-none border-r px-3 font-bold text-ink-soft">+998</span>
    <input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="90 123 45 67"
      className="tabular h-full min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:font-normal placeholder:text-ink-mute"
      value={formatLocalPhone(value)}
      onChange={(e) => onChange(phoneDigits(e.target.value))}
      onPaste={(e) => {
        e.preventDefault()
        onChange(phoneDigits(e.clipboardData.getData('text')))
      }}
      {...props}
    />
  </div>
))
PhoneInput.displayName = 'PhoneInput'
