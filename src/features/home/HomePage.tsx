import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { formatHeaderDate } from '../../lib/date'
import { SummaryCards } from './SummaryCards'
import { TodayTransactions } from './TodayTransactions'

export function HomePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{formatHeaderDate(new Date())}</p>
          <h1 className="bg-gradient-to-r from-white to-white/75 bg-clip-text text-2xl font-semibold text-transparent">Overview</h1>
        </div>
        <Link
          to="/transaction/new"
          className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.45)]"
          aria-label="Add transaction"
        >
          <Icon name="fa-plus" />
        </Link>
      </header>
      <SummaryCards />
      <TodayTransactions />
    </div>
  )
}
