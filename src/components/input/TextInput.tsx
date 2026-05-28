import { type InputHTMLAttributes } from 'react'

const inputClassName = [
  'min-h-11 w-full rounded-xl border border-white/10',
  'bg-white/[0.04] px-3 text-slate-50 outline-none',
  'transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
  'placeholder:text-white/25',
  'focus:border-[var(--accent)] focus:bg-white/[0.06]',
  'focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_15%,transparent)]',
].join(' ')

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClassName} {...props} />
}
