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
      ? [
        'bg-gradient-to-br from-[var(--accent-btn-1)] to-[var(--accent-btn-2)] text-white',
        'shadow-[0_2px_20px_color-mix(in_srgb,var(--accent)_25%,transparent)]',
        'hover:shadow-[0_4px_28px_color-mix(in_srgb,var(--accent)_40%,transparent)]',
        'hover:brightness-110',
      ].join(' ')
      : variant === 'danger'
        ? 'border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15'
        : 'border border-white/8 bg-white/5 text-slate-100 hover:bg-white/8 hover:border-white/12'

  return (
    <button
      className={cx(
        [
          'inline-flex min-h-11 items-center justify-center gap-2',
          'cursor-pointer rounded-xl px-4 font-medium',
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40',
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
