import { Icon } from '@/components'
import type { Wallet } from '@/types/domain'

interface WalletSelectorRowProps {
  ariaLabel: string
  label: string
  wallet: Wallet | undefined
  fallbackName: string
  fallbackColor: string
  showBalance?: boolean
  onClick: () => void
}

export function WalletSelectorRow({
  ariaLabel,
  label,
  wallet,
  fallbackName,
  fallbackColor,
  showBalance = false,
  onClick,
}: WalletSelectorRowProps) {
  const color = wallet?.color ?? fallbackColor

  return (
    <button
      aria-label={ariaLabel}
      className={[
        'flex w-full items-center gap-3 rounded-2xl',
        'border border-white/[0.07] bg-white/4 px-4 py-3 text-left',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{ background: `${color}25`, color }}
      >
        <Icon name={wallet?.icon ?? 'fa-wallet'} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/35">{label}</p>
        <p className="text-sm font-medium">
          {wallet?.name ?? fallbackName}
          {showBalance
            ? ` · ${wallet?.currency ?? ''} ${wallet?.balance.toFixed(2) ?? '0.00'}`
            : ''}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
