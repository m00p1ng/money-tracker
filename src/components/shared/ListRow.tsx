import { Link } from 'react-router'

import { Icon } from '@/components'

type ListRowProps = {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  sub?: string
  trailing?: React.ReactNode
  to: string
}

export function ListRow({
  icon,
  iconBg,
  iconColor,
  label,
  sub,
  trailing,
  to,
}: ListRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 border-b border-white/5 px-4 py-3.5 last:border-b-0 active:bg-white/3"
    >
      <div
        className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] text-sm"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon name={icon} />
      </div>
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
