import cx from 'classnames'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { Icon } from '@/components'

import { NAV_GROUPS } from './designNavigation'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

interface DesignSidebarProps {
  activeId: string
  isOpen?: boolean
  onClose?: () => void
}

function SidebarContent({
  activeId,
  onItemClick,
}: {
  activeId: string
  onItemClick: (groupSlug: string, itemId: string) => void
}) {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const visibleGroups = normalizedSearch
    ? NAV_GROUPS.map((group) => {
      const groupMatches = group.label.toLowerCase().includes(normalizedSearch)

      return {
        ...group,
        items: groupMatches
          ? group.items
          : group.items.filter((item) => item.label.toLowerCase().includes(normalizedSearch)),
      }
    }).filter((group) => group.items.length > 0)
    : NAV_GROUPS.map((group) => ({
      ...group,
      items: group.slug === section
        ? group.items
        : [],
    }))

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeId])

  return (
    <>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[2px] text-white/30">
        Design System
      </p>
      <div className="relative mb-2">
        <Icon
          name="fa-magnifying-glass"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/25"
        />
        <input
          aria-label="Search design sections"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sections"
          className={[
            'h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.04]',
            'pl-8 pr-3 text-[13px] text-white/80 outline-none transition-colors',
            'placeholder:text-white/25 focus:border-accent/35 focus:bg-white/[0.06]',
          ].join(' ')}
        />
      </div>
      {visibleGroups.length > 0
        ? visibleGroups.map((group) => (
          <div key={group.label} className="mt-4 first:mt-0">
            <button
              type="button"
              onClick={() => {
                setSearch('')
                navigate(`/design/${group.slug}`)
                onItemClick(group.slug, '')
              }}
              className={cx(
                'mb-1 w-full px-3 pb-1 text-left text-[10px] font-semibold uppercase tracking-[1px] transition-colors',
                section === group.slug
                  ? 'text-white/50'
                  : 'text-white/25 hover:text-white/40',
              )}
            >
              {group.label}
            </button>
            {group.items.map((item) => (
              <button
                key={item.id}
                ref={item.id === activeId
                  ? activeRef
                  : null}
                type="button"
                onClick={() => {
                  setSearch('')
                  onItemClick(group.slug, item.id)
                }}
                className={cx(
                  'w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors',
                  item.id === activeId && section === group.slug
                    ? 'bg-accent/10 font-semibold text-accent-light'
                    : 'text-white/50 hover:text-white/80',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))
        : <p className="px-3 py-4 text-sm text-white/35">No matches</p>
      }
    </>
  )
}

export function DesignSidebar({
  activeId, isOpen = false, onClose,
}: DesignSidebarProps) {
  const navigate = useNavigate()
  const { section } = useParams<{ section: string }>()

  function handleItemClick(groupSlug: string, itemId: string) {
    if (itemId) {
      if (groupSlug === section) {
        scrollTo(itemId)
      } else {
        navigate(`/design/${groupSlug}`)
      }
    }
    onClose?.()
  }

  return (
    <>
      {/* desktop sidebar */}
      <nav
        className={[
          'hidden w-72 shrink-0 flex-col gap-1 overflow-y-auto',
          'border-r border-white/8 bg-white/2 px-3 py-4 md:flex',
        ].join(' ')}
      >
        <SidebarContent activeId={activeId} onItemClick={handleItemClick} />
      </nav>

      {/* mobile drawer */}
      <div className="md:hidden">
        {/* backdrop */}
        <div
          className={cx(
            'fixed inset-0 z-40 bg-black/60 transition-opacity duration-200',
            isOpen
              ? 'opacity-100'
              : 'pointer-events-none opacity-0',
          )}
          onClick={onClose}
        />
        {/* panel */}
        <nav
          aria-hidden={!isOpen}
          className={cx(
            'fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-1 overflow-y-auto',
            'border-r border-white/8 bg-(--bg) px-3 py-4 transition-transform duration-200',
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full',
          )}
        >
          <SidebarContent activeId={activeId} onItemClick={handleItemClick} />
        </nav>
      </div>
    </>
  )
}
