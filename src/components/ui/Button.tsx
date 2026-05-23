import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'accent' | 'ghost' | 'danger'
    fullWidth?: boolean
  }
>

export function Button({ children, className = '', variant = 'ghost', fullWidth = false, ...props }: ButtonProps) {
  const variantClass =
    variant === 'accent'
      ? 'bg-gradient-to-br from-[var(--accent-btn-1)] to-[var(--accent-btn-2)] text-white'
      : variant === 'danger'
        ? 'bg-red-500/15 text-red-300'
        : 'bg-white/5 text-slate-100'

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-medium transition active:scale-[0.98] disabled:opacity-40 ${fullWidth ? 'w-full' : ''} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
