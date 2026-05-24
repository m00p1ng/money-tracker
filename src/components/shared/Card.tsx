import type { PropsWithChildren } from 'react'

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/4 p-3.5 shadow-2xl shadow-black/20 backdrop-blur ${className}`}>
      {children}
    </section>
  )
}
