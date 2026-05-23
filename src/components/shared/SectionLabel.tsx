import type React from 'react'

interface SectionLabelProps {
  children: React.ReactNode
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/30">{children}</h2>
  )
}
