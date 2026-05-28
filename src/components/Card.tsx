import type { PropsWithChildren } from 'react'

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-2xl border border-white/8 bg-white/5 p-3.5 shadow-2xl shadow-black/30 backdrop-blur-sm ${className}`}>
      {children}
    </section>
  )
}
