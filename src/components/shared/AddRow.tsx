import { Link } from 'react-router'

import { Icon } from '@/components/Icon'

export function AddRow({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-center gap-1.5 px-4 py-[13px] text-[13px] font-semibold text-[var(--accent)]">
      <Icon name="fa-plus" />
      {label}
    </Link>
  )
}
