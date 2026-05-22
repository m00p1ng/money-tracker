import type { PropsWithChildren } from 'react'
import { BottomNav } from './BottomNav'

export function AppShell({ children, showBottomNav = true }: PropsWithChildren<{ showBottomNav?: boolean }>) {
  return (
    <div className="min-h-screen text-slate-50">
      <main className={`mx-auto min-h-screen w-full max-w-[430px] px-4 pt-6 ${showBottomNav ? 'pb-28' : 'pb-6'}`}>{children}</main>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
