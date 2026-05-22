import { Link } from 'react-router'
import { Icon } from './Icon'

const disabledItems = ['Balance', 'Budget', 'Report', 'Setting']

export function BottomNav() {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--nav-border)] bg-black/45 px-4 pb-4 pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[430px] grid-cols-5 text-xs">
        <Link className="flex flex-col items-center gap-1 text-accent" to="/">
          <Icon name="fa-home" />
          <span>Home</span>
        </Link>
        {disabledItems.map((item) => (
          <button key={item} className="flex flex-col items-center gap-1 text-slate-500" disabled type="button">
            <span className="h-4 w-4 rounded-full bg-current opacity-40" />
            <span>{item}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
