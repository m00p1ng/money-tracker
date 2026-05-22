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
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--nav-border)] bg-black/45 px-4 pb-4 pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[430px] grid-cols-5 text-xs">
        {navItems.map((item) => {
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          const className = `flex flex-col items-center gap-1 ${active ? 'text-accent' : 'text-slate-500'}`
          if (!item.enabled) {
            return (
              <button key={item.label} className={className} disabled type="button">
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            )
          }
          return (
            <Link key={item.label} className={className} to={item.to}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
