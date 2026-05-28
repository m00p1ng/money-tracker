import cx from 'classnames'
import type { MouseEventHandler } from 'react'
import { Link } from 'react-router'

import { Icon } from '@/components'

const navItems = [
  {
    label: 'Home',
    to: '/',
    icon: 'fa-home',
    enabled: true,
  },
  {
    label: 'Balance',
    to: '/balance',
    icon: 'fa-wallet',
    enabled: true,
  },
  {
    label: 'Budget',
    to: '/budget',
    icon: 'fa-chart-pie',
    enabled: false,
  },
  {
    label: 'Report',
    to: '/report',
    icon: 'fa-chart-line',
    enabled: false,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: 'fa-gear',
    enabled: true,
  },
] as const

type BottomNavProps = {
  pathname: string
  onSettingsPress: MouseEventHandler<HTMLAnchorElement>
}

export function BottomNav({ pathname, onSettingsPress }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className={[
        'fixed inset-x-0 bottom-0 z-20 border-t border-(--nav-border)',
        'bg-app-bg/92 pb-7 pt-2 backdrop-blur-2xl',
      ].join(' ')}
    >
      <div className="mx-auto grid max-w-107.5 grid-cols-5">
        {navItems.map((item) => {
          const active = item.to === '/'
            ? pathname === '/'
            : pathname.startsWith(item.to)
          const content = (
            <span className="relative flex flex-col items-center gap-0.5">
              <span
                className={cx(
                  'flex h-8 w-12 items-center justify-center rounded-xl',
                  'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                )}
                style={active
                  ? {
                    background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  }
                  : undefined}
              >
                <Icon
                  name={item.icon}
                  className={cx('text-lg', active
                    ? ''
                    : 'text-white/30')}
                  style={active
                    ? { color: 'var(--accent-btn-2)' }
                    : undefined}
                />
              </span>
              <span
                className={cx(
                  'text-[10px] font-medium leading-none',
                  active
                    ? 'font-semibold'
                    : 'text-white/25',
                )}
                style={active
                  ? { color: 'var(--accent-light)' }
                  : undefined}
              >{item.label}</span>
            </span>
          )

          if (!item.enabled) {
            return (
              <button key={item.label} className="flex flex-col items-center py-1" disabled type="button">
                {content}
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              className="flex flex-col items-center py-1"
              onClick={item.label === 'Settings'
                ? onSettingsPress
                : undefined}
              to={item.to}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
