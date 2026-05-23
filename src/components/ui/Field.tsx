import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type FieldProps = PropsWithChildren<{ label: string; error?: string }>

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

const inputClassName = 'min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-slate-50 outline-none focus:border-[var(--accent)]'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClassName} {...props} />
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClassName} {...props} />
}

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClassName} min-h-24 py-2`} {...props} />
}