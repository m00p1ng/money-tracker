import { useWalletStore } from '@/stores/walletStore'
import { useBackNavigate } from '@/context/navigationDirection'
import { AddRow, ListGroup, ListRow, PageHeader } from '@/components/ui'
import { hexToRgba } from '@/lib/color'

export function WalletsPage() {
  const wallets = useWalletStore((state) => state.items)
  const payments = wallets.filter((w) => w.type === 'payment')
  const cards = wallets.filter((w) => w.type === 'credit_card')
  const backNavigate = useBackNavigate()

  return (
    <div className="space-y-5">
      <PageHeader title="Wallets" onBack={() => backNavigate('/settings')} />

      <ListGroup label="Payment Accounts">
        {payments.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            iconBg={hexToRgba(w.color, 0.15)}
            iconColor={w.color}
            label={w.name}
            sub="Payment Account"
            to={`/settings/wallets/${w.id}`}
            trailing={
              <div className="flex items-center gap-2 text-white/25">
                <span className="text-xs text-white/40">{w.currency}</span>
                <span className="text-[11px]">›</span>
              </div>
            }
          />
        ))}
        <AddRow label="Add Payment Account" to="/settings/wallets/new?type=payment" />
      </ListGroup>

      <ListGroup label="Credit Cards">
        {cards.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            iconBg={hexToRgba(w.color, 0.15)}
            iconColor={w.color}
            label={w.name}
            sub="Credit Card"
            to={`/settings/wallets/${w.id}`}
            trailing={
              <div className="flex items-center gap-2 text-white/25">
                <span className="text-xs text-white/40">{w.currency}</span>
                <span className="text-[11px]">›</span>
              </div>
            }
          />
        ))}
        <AddRow label="Add Credit Card" to="/settings/wallets/new?type=credit_card" />
      </ListGroup>
    </div>
  )
}
