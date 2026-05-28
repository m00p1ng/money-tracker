import cx from 'classnames'
import type React from 'react'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <h2 className={cx('text-xs font-semibold uppercase tracking-[2px] text-white/35', className)}>{children}</h2>
  )
}
