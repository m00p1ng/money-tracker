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
        'flex cursor-pointer items-center gap-3 border-b border-white/5',
        'px-4 py-3.5 last:border-b-0',
        'transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:bg-white/4 active:bg-white/6',
      ].join(' ')}
    >
      {left
        ?? (
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center',
              'rounded-[10px] text-base bg-white/5 text-white/55',
            ].join(' ')}
          >
            <Icon name={icon ?? ''} />
          </div>
        )}
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium leading-tight">{label}</p>
        {sub && <p className="mt-0.5 text-sm text-white/40">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-white/20">
        {trailing ?? <Icon name="fa-chevron-right" className="text-xs" />}
      </div>
    </Link>
  )
}
