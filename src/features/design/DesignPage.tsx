// src/features/design/DesignPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { DesignSidebar, DesignTopNav } from './DesignSidebar'
import { TokensSection } from './sections/TokensSection'
import { UIComponentsSection } from './sections/UIComponentsSection'
import { FeatureSection } from './sections/FeatureSection'

const SECTION_IDS = [
  'colors', 'typography', 'spacing',
  'button', 'card', 'field', 'segmented-control', 'type-picker',
  'summary-cards', 'amount-display', 'calculator-keyboard',
  'category-items-card', 'today-transactions', 'upcoming-transactions',
]

export function DesignPage() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(SECTION_IDS[0])
  const contentRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver: track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { root: contentRef.current, threshold: 0.3 },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-slate-50">
      {/* Mobile: horizontal pill nav at top */}
      <DesignTopNav activeId={activeId} />
      {/* Desktop: sidebar + content side by side */}
      <div className="flex min-h-0 flex-1">
        <DesignSidebar activeId={activeId} />
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">Design System</h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
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
  )
}
