import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { useWalletStore } from '../../stores/walletStore'

function WalletRow({ id, name, icon, color, currency, sub }: { id: string; name: string; icon: string; color: string; currency: string; sub: string }) {
  return (
    <Link to={`/settings/wallets/${id}`} className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-[13px] last:border-b-0">
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-sm" style={{ background: `${color}26`, color }}>
        <Icon name={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="mt-0.5 text-[11px] text-white/30">{sub}</p>
      </div>
      <span className="mr-2 text-xs text-white/40">{currency}</span>
      <Icon name="fa-chevron-right" className="text-[11px] text-white/20" />
    </Link>
  )
}

function AddRow({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-center gap-1.5 px-4 py-[13px] text-[13px] font-semibold text-accent">
      <Icon name="fa-plus" />
      {label}
    </Link>
  )
}

function WalletGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 pl-1 text-[11px] uppercase tracking-[1.5px] text-white/30">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/[0.04]">{children}</div>
    </div>
  )
}

export function WalletsPage() {
  const wallets = useWalletStore((state) => state.items)
  const payments = wallets.filter((w) => w.type === 'payment')
  const cards = wallets.filter((w) => w.type === 'credit_card')

  return (
    <div className="space-y-5">
      <header>
        <Link className="inline-flex items-center gap-1.5 text-sm text-accent" to="/settings"><Icon name="fa-chevron-left" className="text-[11px]" />Back</Link>
        <h1 className="mt-3 text-2xl font-semibold">Wallets</h1>
      </header>

      <WalletGroup label="Payment Accounts">
        {payments.map((w) => (
          <WalletRow key={w.id} id={w.id} name={w.name} icon={w.icon} color={w.color} currency={w.currency} sub="Payment Account" />
        ))}
        <AddRow label="Add Payment Account" to="/settings/wallets/new?type=payment" />
      </WalletGroup>

      <WalletGroup label="Credit Cards">
        {cards.map((w) => (
          <WalletRow key={w.id} id={w.id} name={w.name} icon={w.icon} color={w.color} currency={w.currency} sub="Credit Card" />
        ))}
        <AddRow label="Add Credit Card" to="/settings/wallets/new?type=credit_card" />
      </WalletGroup>
    </div>
  )
}
