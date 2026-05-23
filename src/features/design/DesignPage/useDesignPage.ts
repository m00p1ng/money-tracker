import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { DesignPage } from './DesignPage'

const SECTION_IDS = [
  'colors', 'typography', 'spacing',
  'button', 'card', 'field', 'segmented-control', 'type-picker',
  'category-picker', 'currency-picker', 'date-picker', 'repeat-picker', 'wallet-picker',
  'summary-cards', 'amount-display', 'calculator-keyboard',
  'category-items-card', 'today-transactions', 'upcoming-transactions',
]

export function useDesignPage() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(SECTION_IDS[0])
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id)
          }
        },
        { root: contentRef.current, threshold: 0.3 },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return {
    activeId,
    contentRef,
    onNavigateBack: () => navigate(-1),
  }
}
