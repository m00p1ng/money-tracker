import type { PropsWithChildren } from 'react'
import cx from 'classnames'
import { BottomNav } from '@/components/BottomNav'
import { useDesignSystemTrigger } from '@/hooks/useDesignSystemTrigger'

export function AppShell({ children, showBottomNav = true }: PropsWithChildren<{ showBottomNav?: boolean }>) {
  const logoRef = useDesignSystemTrigger()

  return (
    <div className="min-h-screen text-slate-50">
      {/* Invisible logo touch target for long-press trigger */}
      <span
        ref={logoRef as React.RefObject<HTMLSpanElement>}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, width: 48, height: 48, zIndex: 9999, cursor: 'default', userSelect: 'none' }}
      />
      <main className={cx('mx-auto min-h-screen w-full max-w-[430px] px-4 pt-6', showBottomNav ? 'pb-28' : 'pb-6')}>{children}</main>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
