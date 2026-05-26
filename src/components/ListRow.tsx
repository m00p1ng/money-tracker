import { Link } from 'react-router'

import { Icon } from '@/components'

type ListRowProps = {
  icon?: string
  left?: React.ReactNode
  label: string
  sub?: string
  trailing?: React.ReactNode
  to: string
}

export function ListRow({
  icon,
  left,
  label,
  sub,
  trailing,
  to,
}: ListRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 border-b border-white/5 px-4 py-3.5 last:border-b-0 active:bg-white/3"
    >
      {left
        ?? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm"
            style={{ color: '#63758F' }}
          >
            <Icon name={icon ?? ''} style={{ height: 40 }} />
          </div>
        )}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium">{label}</p>
        {sub && <p className="mt-0.5 text-sm text-white/35">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-white/25">
        {trailing ?? <Icon name="fa-chevron-right" className="text-base" />}
      </div>
    </Link>
  )
}
