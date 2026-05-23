// src/features/design/DesignSidebar.tsx
import { useState } from 'react'

const NAV_GROUPS = [
  {
    label: 'Tokens',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
    ],
  },
  {
    label: 'UI Components',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'card', label: 'Card' },
      { id: 'field', label: 'Field' },
      { id: 'segmented-control', label: 'SegmentedControl' },
      { id: 'type-picker', label: 'TypePickerDropdown' },
    ],
  },
  {
    label: 'Feature',
    items: [
      { id: 'summary-cards', label: 'SummaryCards' },
      { id: 'amount-display', label: 'AmountDisplay' },
      { id: 'calculator-keyboard', label: 'CalculatorKeyboard' },
      { id: 'category-items-card', label: 'CategoryItemsCard' },
      { id: 'today-transactions', label: 'TodayTransactions' },
      { id: 'upcoming-transactions', label: 'UpcomingTransactions' },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Horizontal pill bar for small screens */
function TopNav({ activeId }: { activeId: string }) {
  return (
    <div className="flex overflow-x-auto border-b border-white/[0.08] bg-white/[0.02] px-3 py-2 md:hidden">
      <div className="flex gap-1.5">
        {ALL_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              activeId === item.id
                ? 'bg-accent/20 text-accent-light'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Vertical sidebar for md+ screens */
function SidebarNav({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden w-44 flex-shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/[0.08] bg-white/[0.02] px-2 py-4 md:flex">
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[2px] text-white/30">Design System</p>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-[1px] text-white/25">
            {group.label}
          </p>
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors ${
                activeId === item.id
                  ? 'bg-accent/10 font-semibold text-accent-light'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function DesignSidebar({ activeId }: { activeId: string }) {
  return (
    <>
      <TopNav activeId={activeId} />
      <SidebarNav activeId={activeId} />
    </>
  )
}
