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
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        {trailing}
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4 mt-2">
        {children}
      </div>
    </div>
  )
}
