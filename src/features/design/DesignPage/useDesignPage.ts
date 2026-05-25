import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { NAV_GROUPS } from '../DesignSidebar'

export function useDesignPage() {
  const navigate = useNavigate()
  const { section = NAV_GROUPS[0].slug } = useParams<{ section: string }>()
  const contentRef = useRef<HTMLDivElement>(null)

  const activeGroup = NAV_GROUPS.find((g) => g.slug === section) ?? NAV_GROUPS[0]
  const sectionIds = activeGroup.items.map((i) => i.id)

  const [activeId, setActiveId] = useState(sectionIds[0])

  useEffect(() => {
    setActiveId(sectionIds[0])
  }, [section]) // reset highlight when switching pages

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
  }, [section]) // re-observe when switching pages

  return {
    activeId,
    section,
    contentRef,
    onNavigateBack: () => {
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/', { replace: true })
      }
    },
  }
}
