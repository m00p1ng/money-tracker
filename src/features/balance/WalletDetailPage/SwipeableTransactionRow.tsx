import cx from 'classnames'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useNavigate } from 'react-router'

import { Icon, TransactionRow } from '@/components'
import type { RunningWalletRow } from '@/features/balance/balanceCalculations'
import { buildTransactionBaseProps, formatAmount } from '@/lib'
import type { Category, Wallet } from '@/types/domain'

type Props = {
  row: RunningWalletRow
  wallet: Wallet
  wallets: Wallet[]
  categories: Category[]
  onToggleCleared: (id: string) => void
}

export function SwipeableTransactionRow({
  row,
  wallet,
  wallets,
  categories,
  onToggleCleared,
}: Props) {
  const navigate = useNavigate()
  const x = useMotionValue(0)
  const buttonOpacity = useTransform(x, [-72, -20], [1, 0])
  const isCredit = wallet.type === 'credit_card'
  const { transaction } = row
  const category = transaction.type !== 'transfer'
    ? categories.find((c) => c.id === transaction.items[0]?.categoryId)
    : undefined
  const base = buildTransactionBaseProps(transaction, category, wallets, wallet.color)
  const isCleared = transaction.cleared ?? false

  function handleDragEnd() {
    if (x.get() < -36) {
      animate(x, -72, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      })
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      })
    }
  }

  function handleRowClick() {
    if (Math.abs(x.get()) > 4) {
      return
    }
    navigate(`/transaction/${transaction.id}`)
  }

  function handleActionClick() {
    onToggleCleared(transaction.id)
    animate(x, 0, {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    })
  }

  return (
    <div className="relative mb-2 overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-y-0 right-0 flex w-18 flex-col items-center justify-center gap-1 bg-accent/15"
        style={{ opacity: buttonOpacity }}
      >
        <button
          type="button"
          onClick={handleActionClick}
          className="flex flex-col items-center gap-1 p-2"
          aria-label={isCleared
            ? 'Mark as uncleared'
            : 'Mark as cleared'}
        >
          <Icon
            name={isCleared
              ? 'fa-circle-xmark'
              : 'fa-circle-check'}
            className={cx('text-lg', isCleared
              ? 'text-white/40'
              : 'text-income')}
          />
          <span className={cx('text-[10px] font-semibold', isCleared
            ? 'text-white/40'
            : 'text-income')}>
            {isCleared
              ? 'Unclear'
              : 'Clear'}
          </span>
        </button>
      </motion.div>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -72, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={handleRowClick}
        className="cursor-pointer"
      >
        <div className="relative">
          <TransactionRow
            {...base}
            amount={`${row.amount >= 0
              ? '+'
              : '-'}${formatAmount(Math.abs(row.amount), wallet.currency)}`}
            amountColor={row.amount >= 0
              ? 'text-income'
              : 'text-expense'}
            secondaryAmount={isCredit
              ? `${formatAmount(row.runningAmount, wallet.currency)} debt`
              : formatAmount(row.runningAmount, wallet.currency)}
            secondaryAmountColor={isCredit
              ? 'text-expense/70'
              : 'text-white/28'}
          />
          {isCleared && (
            <Icon
              name="fa-circle-check"
              className="pointer-events-none absolute bottom-2 right-2 text-[10px]"
              style={{ color: 'var(--accent-light)' }}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
