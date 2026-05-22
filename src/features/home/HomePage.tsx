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
          <h1 className="text-2xl font-semibold">Overview</h1>
        </div>
        <Link
          to="/transaction/new"
          className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent-btn-1)] to-[var(--accent-btn-2)] text-white"
          aria-label="Add transaction"
        >
          <Icon name="fa-circle-plus" />
        </Link>
      </header>
      <SummaryCards />
      <TodayTransactions />
    </div>
  )
}
