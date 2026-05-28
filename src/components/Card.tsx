import type { PropsWithChildren } from 'react'

const topGlow = [
  'linear-gradient(90deg,',
  'transparent,',
  'rgba(255,255,255,0.12) 30%,',
  'rgba(255,255,255,0.18) 50%,',
  'rgba(255,255,255,0.12) 70%,',
  'transparent)',
].join(' ')

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 shadow-2xl shadow-black/40 backdrop-blur-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: topGlow }}
      />
      {children}
    </section>
  )
}
