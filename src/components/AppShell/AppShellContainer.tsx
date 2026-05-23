import type { PropsWithChildren } from 'react'

import { useDesignSystemTrigger } from '@/hooks/useDesignSystemTrigger'

import { AppShell } from './AppShell'

export function AppShellContainer({ children, showBottomNav = true }: PropsWithChildren<{ showBottomNav?: boolean }>) {
  const logoRef = useDesignSystemTrigger()
  return <AppShell logoRef={logoRef as React.RefObject<HTMLSpanElement>} showBottomNav={showBottomNav}>{children}</AppShell>
}
