import cx from 'classnames'
import type { PropsWithChildren } from 'react'

import { BottomNav } from '@/components'
import { Background } from '@/components/Background'

type AppShellProps = PropsWithChildren<{
  showBottomNav?: boolean
}>

export function AppShell({ children, showBottomNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-50">
      <Background />
      <main
        className={cx(
          'mx-auto min-h-screen w-full max-w-107.5 px-4 pt-6',
          showBottomNav
            ? 'pb-28'
            : 'pb-6',
        )}
      >
        {children}
      </main>
      {showBottomNav
        ? <BottomNav />
        : null}
    </div>
  )
}
