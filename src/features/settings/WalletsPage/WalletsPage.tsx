import {
  AddRow,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
} from '@/components'
import type { Wallet } from '@/types/domain'

interface WalletsPageProps {
  payments: Wallet[]
  cards: Wallet[]
  onBack: () => void
}

function WalletTrailing({ currency }: { currency: string }) {
  return (
    <div className="flex items-center gap-2 text-white/25">
      <span className="text-xs text-white/40">{currency}</span>
      <Icon name="fa-chevron-right" className="text-base" />
    </div>
  )
}

export function WalletsPage({
  payments,
  cards,
  onBack,
}: WalletsPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Wallets" onBack={onBack} />

      <ListGroup label="Payment Accounts">
        {payments.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            label={w.name}
            sub="Payment Account"
            to={`/settings/wallets/${w.id}`}
            trailing={<WalletTrailing currency={w.currency} />}
          />
        ))}
        <AddRow label="Add Payment Account" to="/settings/wallets/new?type=payment" />
      </ListGroup>

      <ListGroup label="Credit Cards">
        {cards.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            label={w.name}
            sub="Credit Card"
            to={`/settings/wallets/${w.id}`}
            trailing={<WalletTrailing currency={w.currency} />}
          />
        ))}
        <AddRow label="Add Credit Card" to="/settings/wallets/new?type=credit_card" />
      </ListGroup>
    </div>
  )
}
