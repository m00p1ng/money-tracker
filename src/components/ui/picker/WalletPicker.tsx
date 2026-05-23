import cx from 'classnames'

import { Icon, BottomSheet } from '@/components'
import type { Wallet } from '@/types/domain'

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
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Wallet">
      <div className="space-y-1.5 px-4">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3.5 py-3',
              { 'border border-[var(--accent)]/30 bg-[var(--accent)]/[0.12]': selectedId === wallet.id },
            )}
            onClick={() => {
              onSelect(wallet.id); onClose()
            }}
            type="button"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] text-sm"
              style={{ background: `${wallet.color}25`, color: wallet.color }}
            >
              <Icon name={wallet.icon} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{wallet.name}</p>
              <p className="text-[11px] text-white/40">{wallet.currency} · {wallet.balance.toFixed(2)}</p>
            </div>
            {selectedId === wallet.id && (
              <Icon name="fa-circle-check" className="text-[var(--accent-light)]" />
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
