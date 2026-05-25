import React from 'react'

interface SubSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

export function SubSection({ id, title, children }: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <h3 className="mb-3 text-base font-semibold text-white/70">{title}</h3>
      {children}
      <hr className="mt-6 border-white/6" />
    </section>
  )
}

export function VariantLabel({ label }: { label: string }) {
  return <p className="mt-2 text-center text-xs text-white/30">{label}</p>
}

export function PageGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <h3 className="text-sm font-bold uppercase tracking-[2px] text-white/30">{label}</h3>
      {children}
    </div>
  )
}
