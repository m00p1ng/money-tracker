import partition from 'lodash/partition'

import { Icon } from '@/components'
import type { Wallet } from '@/types/domain'

import {
  SelectorSheet,
  type SelectorOption,
  type SelectorSection,
} from './SelectorSheet'

interface WalletPickerProps {
  isOpen: boolean
  wallets: Wallet[]
  selectedId: string
  onSelect: (walletId: string) => void
  onClose: () => void
}

function walletToOption(wallet: Wallet): SelectorOption<string> {
  return {
    label: wallet.name,
    value: wallet.id,
    description: `${wallet.currency} · ${wallet.balance.toFixed(2)}`,
    leading: (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center text-lg"
        style={{ color: '#63758F' }}
      >
        <Icon name={wallet.icon} />
      </div>
    ),
  }
}

export function WalletPicker({
  isOpen,
  wallets,
  selectedId,
  onSelect,
  onClose,
}: WalletPickerProps) {
  const [payment, credit] = partition(wallets, (wallet) => wallet.type === 'payment')

  const sections: SelectorSection<string>[] = []
  if (payment.length > 0) {
    sections.push({
      title: 'Personal Account',
      options: payment.map(walletToOption),
    })
  }

  if (credit.length > 0) {
    sections.push({
      title: 'Credit Card',
      options: credit.map(walletToOption),
    })
  }

  return (
    <SelectorSheet
      isOpen={isOpen}
      title="Wallet"
      sections={sections}
      value={selectedId}
      onSelect={(walletId) => {
        onSelect(walletId)
        onClose()
      }}
      onClose={onClose}
    />
  )
}
