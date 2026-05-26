import cx from 'classnames'
import type React from 'react'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <h2 className={cx('text-sm tracking-[1.5px] text-white/30', className)}>{children}</h2>
  )
}
