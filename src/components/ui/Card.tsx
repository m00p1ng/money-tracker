import type { PropsWithChildren } from 'react'

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur ${className}`}>
      {children}
    </section>
  )
}
