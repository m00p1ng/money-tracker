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
      className={[
        'flex cursor-pointer items-center gap-1 border-b border-white/5',
        'px-4 py-3.5 last:border-b-0 hover:bg-white/[0.03] active:bg-white/3',
      ].join(' ')}
    >
      {left
        ?? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg text-slate-500"
          >
            <Icon name={icon ?? ''} />
          </div>
        )}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium">{label}</p>
        {sub && <p className="mt-0.5 text-sm text-white/40">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-white/25">
        {trailing ?? <Icon name="fa-chevron-right" className="text-base" />}
      </div>
    </Link>
  )
}
