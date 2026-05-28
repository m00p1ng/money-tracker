import { type PropsWithChildren } from 'react'

type FieldProps = PropsWithChildren<{ label: string; error?: string }>

export function Field({
  label,
  error,
  children,
}: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-[1.5px] text-white/40">{label}</span>
      {children}
      {error
        ? <span className="block text-xs text-danger">{error}</span>
        : null}
    </label>
  )
}
