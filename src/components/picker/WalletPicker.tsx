import { Icon } from '@/components'
import type { Wallet } from '@/types/domain'

import { SelectorSheet, type SelectorOption } from './SelectorSheet'

interface WalletPickerProps {
  isOpen: boolean
  wallets: Wallet[]
  selectedId: string
  onSelect: (walletId: string) => void
  onClose: () => void
}

export function WalletPicker({
  isOpen,
  wallets,
  selectedId,
  onSelect,
  onClose,
}: WalletPickerProps) {
  const options: SelectorOption<string>[] = wallets.map((wallet) => ({
    label: wallet.name,
    value: wallet.id,
    description: `${wallet.currency} · ${wallet.balance.toFixed(2)}`,
    leading: (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-sm"
        style={{ background: `${wallet.color}25`, color: wallet.color }}
      >
        <Icon name={wallet.icon} />
      </div>
    ),
  }))

  return (
    <SelectorSheet
      isOpen={isOpen}
      title="Wallet"
      options={options}
      value={selectedId}
      onSelect={(walletId) => {
        onSelect(walletId)
        onClose()
      }}
      onClose={onClose}
    />
  )
}
