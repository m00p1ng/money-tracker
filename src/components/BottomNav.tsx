import { Link, useLocation } from 'react-router'
import { Icon } from './Icon'

const navItems = [
  { label: 'Home', to: '/', icon: 'fa-home', enabled: true },
  { label: 'Balance', to: '/balance', icon: 'fa-wallet', enabled: true },
  { label: 'Budget', to: '/budget', icon: 'fa-chart-pie', enabled: false },
  { label: 'Report', to: '/report', icon: 'fa-chart-line', enabled: false },
  { label: 'Settings', to: '/settings', icon: 'fa-gear', enabled: true },
] as const

export function BottomNav() {
  const location = useLocation()

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--nav-border)] bg-app-bg/95 pb-7 pt-2.5 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[430px] grid-cols-5">
        {navItems.map((item) => {
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          const content = (
            <>
              <Icon
                name={item.icon}
                className={`text-[19px] mb-1 ${active ? 'text-accent' : 'text-white/22'}`}
                style={active ? { color: 'var(--accent-btn-2)' } : undefined}
              />
              <span
                className={`text-[10px] leading-none ${active ? 'font-semibold bg-gradient-to-br from-[var(--accent-btn-2)] to-[var(--accent)] bg-clip-text text-transparent' : 'text-white/22'}`}
              >{item.label}</span>
              {active && (
                <span className="mt-1 block h-1 w-1 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
              )}
            </>
          )

          if (!item.enabled) {
            return (
              <button key={item.label} className="flex flex-col items-center py-1.5" disabled type="button">
                {content}
              </button>
            )
          }
          return (
            <Link key={item.label} className="flex flex-col items-center py-1.5" to={item.to}>
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
