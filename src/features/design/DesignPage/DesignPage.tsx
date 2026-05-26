import { useState } from 'react'
import { Navigate } from 'react-router'

import { Icon } from '@/components'

import { DesignSidebar } from './components'
import {
  getDesignGroup,
  type DesignNavItem,
} from './designRegistry'

type DesignPageProps = {
  activeId: string
  activeItems?: readonly DesignNavItem[]
  section: string
  contentRef: React.RefObject<HTMLDivElement | null>
  onNavigateBack: () => void
}

export function DesignPage({
  activeId,
  activeItems,
  section,
  contentRef,
  onNavigateBack,
}: DesignPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const activeGroup = getDesignGroup(section)

  if (!activeGroup) {
    return <Navigate to="/design/tokens" replace />
  }

  const SectionComponent = activeGroup.component
  const groupLabel = activeGroup.label

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-(--bg) text-slate-50">
      {/* mobile top bar */}
      <div className="flex items-center gap-3 border-b border-white/8 bg-white/2 px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMenuOpen(true)}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg text-white/50',
            'hover:bg-white/8 hover:text-white/80',
          ].join(' ')}
        >
          <Icon name="fa-bars" className="text-sm" />
        </button>
        <span className="flex-1 text-sm font-semibold text-white/70">{groupLabel}</span>
        <button
          type="button"
          onClick={onNavigateBack}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg text-white/50',
            'hover:bg-white/8 hover:text-white/80',
          ].join(' ')}
          aria-label="Go home"
        >
          <Icon name="fa-home" className="text-sm" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <DesignSidebar
          activeId={activeId}
          activeItems={activeItems}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-107.5">
            <div className="mb-6 hidden items-center justify-between md:flex">
              <h1 className="text-xl font-bold">{groupLabel}</h1>
              <button
                type="button"
                onClick={onNavigateBack}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-lg text-white/50',
                  'hover:bg-white/8 hover:text-white/80',
                ].join(' ')}
                aria-label="Go home"
              >
                <Icon name="fa-home" className="text-sm" />
              </button>
            </div>
            <SectionComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
