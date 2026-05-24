import type { PropsWithChildren } from 'react'

import { AppShell } from './AppShell'

export function AppShellContainer({ children, showBottomNav = true }: PropsWithChildren<{ showBottomNav?: boolean }>) {
  return (
    <AppShell
      showBottomNav={showBottomNav}
    >
      {children}
    </AppShell>
  )
}
