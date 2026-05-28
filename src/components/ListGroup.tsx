import { SectionLabel } from './SectionLabel'

interface ListGroupProps {
  label: string
  trailing?: React.ReactNode
  children: React.ReactNode
}

export function ListGroup({
  label, trailing, children,
}: ListGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <SectionLabel>{label}</SectionLabel>
        {trailing}
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-white/[0.035]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 50%, transparent)' }}
        />
        {children}
      </div>
    </div>
  )
}
