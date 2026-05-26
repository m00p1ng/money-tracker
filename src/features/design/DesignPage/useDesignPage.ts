import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { NAV_GROUPS } from './designNavigation'
import type { DesignNavItem } from './designRegistry'

export function collectDesignNavItems(root: ParentNode): DesignNavItem[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-design-section][id]'))
    .map((el) => ({
      id: el.id,
      label: el.dataset.designSectionLabel?.trim() || el.id,
    }))
    .filter((item) => item.id.length > 0 && item.label.length > 0)
}

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

  const [activeItems, setActiveItems] = useState<readonly DesignNavItem[] | undefined>()
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '')
  const visibleSectionIds = useMemo(
    () => activeItems?.map((item) => item.id) ?? sectionIds,
    [activeItems, sectionIds],
  )
  const visibleActiveId = visibleSectionIds.includes(activeId)
    ? activeId
    : (visibleSectionIds[0] ?? '')

  useEffect(() => {
    const root = contentRef.current

    if (!root) {
      setActiveItems(undefined)

      return
    }

    const readItems = () => setActiveItems(collectDesignNavItems(root))

    readItems()

    const observer = new MutationObserver(readItems)
    observer.observe(root, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [section])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const id of visibleSectionIds) {
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
  }, [visibleSectionIds]) // re-observe when switching pages or section list changes

  return {
    activeId: visibleActiveId,
    activeItems,
    section,
    contentRef,
    onNavigateBack: () => navigate('/'),
  }
}
