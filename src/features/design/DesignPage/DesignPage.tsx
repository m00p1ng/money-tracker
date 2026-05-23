import { DesignSidebar, DesignTopNav } from '@/features/design/DesignSidebar'
import { TokensSection } from '@/features/design/sections/TokensSection'
import { UIComponentsSection } from '@/features/design/sections/UIComponentsSection'
import { FeatureSection } from '@/features/design/sections/FeatureSection'

type DesignPageProps = {
  activeId: string
  contentRef: React.RefObject<HTMLDivElement | null>
  onNavigateBack: () => void
}

export function DesignPage({ activeId, contentRef, onNavigateBack }: DesignPageProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-slate-50">
      <DesignTopNav activeId={activeId} />
      <div className="flex min-h-0 flex-1">
        <DesignSidebar activeId={activeId} />
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-[430px]">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold">Design System</h1>
              <button
                type="button"
                onClick={onNavigateBack}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/50 hover:text-white/80"
              >
                ← Back
              </button>
            </div>
            <TokensSection />
            <hr className="my-8 border-white/[0.08]" />
            <UIComponentsSection />
            <hr className="my-8 border-white/[0.08]" />
            <FeatureSection />
          </div>
        </div>
      </div>
    </div>
  )
}
