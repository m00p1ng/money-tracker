import { Link, useLocation } from 'react-router'
import { Icon } from './Icon'

const navItems = [
  { label: 'Home', icon: 'fa-home', to: '/' },
  { label: 'Balance', icon: 'fa-wallet', to: null },
  { label: 'Budget', icon: 'fa-chart-pie', to: null },
  { label: 'Report', icon: 'fa-chart-line', to: null },
  { label: 'Setting', icon: 'fa-gear', to: null },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-black/80 pb-7 pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[430px] grid-cols-5">
        {navItems.map(({ label, icon, to }) => {
          const active = to !== null && pathname === to
          const inner = (
            <>
              <Icon name={icon} className={`text-[19px] ${active ? 'text-accent' : 'text-white/25'}`} />
              <span className={`text-[10px] ${active ? 'font-semibold text-accent' : 'text-white/25'}`}>{label}</span>
              {active && <span className="mx-auto mt-1 h-1 w-1 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />}
            </>
          )
          return to ? (
            <Link key={label} to={to} className="flex flex-col items-center gap-1 py-1.5">
              {inner}
            </Link>
          ) : (
            <button key={label} type="button" disabled className="flex flex-col items-center gap-1 py-1.5">
              {inner}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
