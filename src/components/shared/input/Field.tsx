import { type PropsWithChildren } from 'react'

type FieldProps = PropsWithChildren<{ label: string; error?: string }>

export function Field({
  label,
  error,
  children,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error
        ? <span className="block text-xs text-danger">{error}</span>
        : null}
    </label>
  )
}
