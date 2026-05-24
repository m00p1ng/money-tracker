import { type InputHTMLAttributes } from 'react'

const inputClassName = [
  'min-h-11 w-full rounded-lg border border-white/10',
  'bg-white/5 px-3 text-slate-50 outline-none focus:border-[var(--accent)]',
].join(' ')

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClassName} {...props} />
}
