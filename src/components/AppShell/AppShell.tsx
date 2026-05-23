import cx from 'classnames'
import type { PropsWithChildren } from 'react'

import { BottomNav } from '@/components'


type AppShellProps = PropsWithChildren<{
  showBottomNav?: boolean
  logoRef: React.RefObject<HTMLSpanElement>
}>

export function AppShell({
  children,
  showBottomNav = true,
  logoRef,
}: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-50">
      <span
        ref={logoRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          zIndex: 9999,
          cursor: 'default',
          userSelect: 'none',
        }}
      />
      <main
        className={cx(
          'mx-auto min-h-screen w-full max-w-[430px] px-4 pt-6',
          showBottomNav ? 'pb-28' : 'pb-6',
        )}
      >{children}</main>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
