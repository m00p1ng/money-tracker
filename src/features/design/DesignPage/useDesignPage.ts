import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { NAV_GROUPS } from './designNavigation'

export function useDesignPage() {
  const navigate = useNavigate()
  const { section = NAV_GROUPS[0].slug } = useParams<{ section: string }>()
  const contentRef = useRef<HTMLDivElement>(null)

  const activeGroup = useMemo(
    () => NAV_GROUPS.find((g) => g.slug === section) ?? NAV_GROUPS[0],
    [section],
  )
  const sectionIds = useMemo(
    () => activeGroup.items.map((i) => i.id),
    [activeGroup],
  )

  const [activeId, setActiveId] = useState(sectionIds[0])
  const visibleActiveId = sectionIds.includes(activeId)
    ? activeId
    : sectionIds[0]

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (!el) {
        continue
      }
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
  }, [sectionIds]) // re-observe when switching pages

  return {
    activeId: visibleActiveId,
    section,
    contentRef,
    onNavigateBack: () => navigate('/'),
  }
}
