import cx from 'classnames'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'accent' | 'ghost' | 'danger'
    fullWidth?: boolean
  }
>

export function Button({
  children,
  className = '',
  variant = 'ghost',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'accent'
      ? 'bg-gradient-to-br from-[var(--accent-btn-1)] to-[var(--accent-btn-2)] text-white'
      : variant === 'danger'
        ? 'bg-danger/15 text-danger'
        : 'bg-white/5 text-slate-100'

  return (
    <button
      className={cx(
        [
          'inline-flex min-h-11 items-center justify-center gap-2',
          'cursor-pointer rounded-xl px-4 font-medium transition',
          'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
        ].join(' '),
        { 'w-full': fullWidth },
        variantClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
