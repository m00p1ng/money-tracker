import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type FieldProps = PropsWithChildren<{ label: string; error?: string }>

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-300">{error}</span> : null}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-slate-50 outline-none focus:border-[var(--accent)]" {...props} />
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-slate-50 outline-none focus:border-[var(--accent)]" {...props} />
}

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="min-h-24 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-50 outline-none focus:border-[var(--accent)]" {...props} />
}