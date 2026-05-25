import { Navigate } from 'react-router'

import {
  DesignSidebar,
  DesignTopNav,
  NAV_GROUPS,
} from '@/features/design/DesignSidebar'
import { BalanceFeatSection } from '@/features/design/sections/features/BalanceFeatSection'
import { CalendarFeatSection } from '@/features/design/sections/features/CalendarFeatSection'
import { HomeFeatSection } from '@/features/design/sections/features/HomeFeatSection'
import { SettingsFeatSection } from '@/features/design/sections/features/SettingsFeatSection'
import { TransactionFeatSection } from '@/features/design/sections/features/TransactionFeatSection'
import { SharedComponentsSection } from '@/features/design/sections/SharedComponentsSection'
import { TokensSection } from '@/features/design/sections/TokensSection'
import { UIComponentsSection } from '@/features/design/sections/UIComponentsSection'

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
  const SectionComponent = SECTION_COMPONENTS[section]

  if (!SectionComponent) {
    return <Navigate to="/design/tokens" replace />
  }

  const groupLabel = NAV_GROUPS.find((g) => g.slug === section)?.label ?? 'Design System'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-(--bg) text-slate-50">
      <DesignTopNav activeId={activeId} section={section} />
      <div className="flex min-h-0 flex-1">
        <DesignSidebar activeId={activeId} />
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-107.5">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold">{groupLabel}</h1>
              <button
                type="button"
                onClick={onNavigateBack}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:text-white/80"
              >
                ← Back
              </button>
            </div>
            <SectionComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
