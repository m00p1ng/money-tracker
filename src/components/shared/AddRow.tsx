import { Link } from 'react-router'

import { Icon } from '@/components'

interface AddRowProps {
  label: string
  to: string
}

export function AddRow({ label, to }: AddRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-1.5 px-4 py-3.25 text-base font-semibold text-(--accent)"
    >
      <Icon name="fa-plus" />
      {label}
    </Link>
  )
}
