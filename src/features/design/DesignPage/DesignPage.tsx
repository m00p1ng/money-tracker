import { useState } from 'react'
import { Navigate } from 'react-router'

import { Icon } from '@/components'

import {
  BalanceFeatSection,
  CalendarFeatSection,
  DesignSidebar,
  HomeFeatSection,
  SettingsFeatSection,
  SharedComponentsSection,
  TokensSection,
  TransactionFeatSection,
  UIComponentsSection,
} from './components'
import { NAV_GROUPS } from './designNavigation'

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  'tokens': TokensSection,
  'ui-components': UIComponentsSection,
  'shared-components': SharedComponentsSection,
  'feature-home': HomeFeatSection,
  'feature-balance': BalanceFeatSection,
  'feature-transaction': TransactionFeatSection,
  'feature-calendar': CalendarFeatSection,
  'feature-settings': SettingsFeatSection,
}

type DesignPageProps = {
  activeId: string
  section: string
  contentRef: React.RefObject<HTMLDivElement | null>
  onNavigateBack: () => void
}

export function DesignPage({
  activeId,
  section,
  contentRef,
  onNavigateBack,
}: DesignPageProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const SectionComponent = SECTION_COMPONENTS[section]

  if (!SectionComponent) {
    return <Navigate to="/design/tokens" replace />
  }

  const groupLabel = NAV_GROUPS.find((g) => g.slug === section)?.label ?? 'Design System'

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
