import type { PropsWithChildren } from 'react'

import { BottomNav } from '@/components'

type AppShellProps = PropsWithChildren<{
  showBottomNav?: boolean
}>

export function AppShell({ children, showBottomNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-50" style={{ minHeight: '100dvh' }}>
      <main
        className="mx-auto min-h-screen w-full max-w-107.5"
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
          paddingBottom: showBottomNav
            ? 'calc(7rem + env(safe-area-inset-bottom, 0px))'
            : 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
        }}
      >
        {children}
      </main>
      {showBottomNav
        ? <BottomNav />
        : null}
    </div>
  )
}
