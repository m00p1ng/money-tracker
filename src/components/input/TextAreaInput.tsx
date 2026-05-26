import { type TextareaHTMLAttributes } from 'react'

const inputClassName = [
  'min-h-11 w-full rounded-lg border border-white/10',
  'bg-white/5 px-3 text-slate-50 outline-none focus:border-[var(--accent)]',
].join(' ')

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClassName} min-h-24 py-2`} {...props} />
}
