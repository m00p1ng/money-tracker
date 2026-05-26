import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import {
  AnimatedBar,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
} from '@/components'
import { formatAmount, formatSignedAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

import { SortableWalletRow } from './components/SortableWalletRow'

export type WalletWithAmount = {
  wallet: Wallet;
  amount: number;
}

export type BalancePageProps = {
  paymentWallets: WalletWithAmount[]
  creditCards: WalletWithAmount[]
  assets: number
  debt: number
  isEditMode: boolean
  onToggleEditMode: () => void
  onAddWallet: () => void
  onEditWallet: (id: string) => void
  onReorder: (ids: string[]) => Promise<void>
}

export function BalancePage({
  paymentWallets,
  creditCards,
  assets,
  debt,
  isEditMode,
  onToggleEditMode,
  onAddWallet,
  onEditWallet,
  onReorder,
}: BalancePageProps) {
  const maxBarValue = Math.max(assets, debt)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent, group: WalletWithAmount[]) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIndex = group.findIndex(({ wallet }) => wallet.id === active.id)
    const newIndex = group.findIndex(({ wallet }) => wallet.id === over.id)
    const newOrder = arrayMove(group, oldIndex, newIndex)
    onReorder(newOrder.map(({ wallet }) => wallet.id))
  }

  const editButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className="flex h-9 items-center justify-center rounded-lg px-3 text-sm
        font-medium text-slate-300 active:bg-white/5"
    >
      Edit
    </button>
  )

  const doneButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold active:bg-white/5"
      style={{ color: 'var(--accent-light)' }}
    >
      Done
    </button>
  )

  const addButton = (
    <button
      type="button"
      onClick={onAddWallet}
      aria-label="Add wallet"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 active:bg-white/5"
    >
      <Icon name="fa-plus" className="text-base" />
    </button>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Balance"
        leftSlot={isEditMode
          ? addButton
          : undefined}
        rightSlot={isEditMode
          ? doneButton
          : editButton}
      />

      <div className="space-y-2">
        <AnimatedBar
          value={assets}
          maxValue={maxBarValue}
          colorFrom="var(--income)"
          colorTo="var(--income)"
          textColor="var(--income-text)"
          currency=""
          delay={0.1}
        />
        <AnimatedBar
          value={debt}
          maxValue={maxBarValue}
          colorFrom="var(--expense)"
          colorTo="var(--expense)"
          textColor="var(--expense-text)"
          currency=""
          delay={0.2}
        />
      </div>

      {paymentWallets.length > 0 && (
        <ListGroup label="Payment Accounts">
          {isEditMode
            ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, paymentWallets)}
              >
                <SortableContext
                  items={paymentWallets.map(({ wallet }) => wallet.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {paymentWallets.map(({ wallet, amount }) => (
                    <SortableWalletRow
                      key={wallet.id}
                      wallet={wallet}
                      amount={amount}
                      onEdit={onEditWallet}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )
            : paymentWallets.map(({ wallet, amount }) => (
              <ListRow
                key={wallet.id}
                icon={wallet.icon}
                label={wallet.name}
                to={`/balance/wallet/${wallet.id}`}
                trailing={
                  <>
                    <span className="text-sm font-semibold text-white/55">
                      {formatSignedAmount(amount, wallet.currency)}
                    </span>
                    <Icon name="fa-chevron-right" className="text-base" />
                  </>
                }
              />
            ))}
        </ListGroup>
      )}

      {creditCards.length > 0 && (
        <ListGroup label="Credit Cards">
          {isEditMode
            ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, creditCards)}
              >
                <SortableContext
                  items={creditCards.map(({ wallet }) => wallet.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {creditCards.map(({ wallet, amount }) => (
                    <SortableWalletRow
                      key={wallet.id}
                      wallet={wallet}
                      amount={amount}
                      onEdit={onEditWallet}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )
            : creditCards.map(({ wallet, amount }) => (
              <ListRow
                key={wallet.id}
                icon={wallet.icon}
                label={wallet.name}
                to={`/balance/wallet/${wallet.id}`}
                trailing={
                  <>
                    <span className="text-sm font-semibold text-white/55">
                      {formatAmount(amount, wallet.currency)}
                    </span>
                    <Icon name="fa-chevron-right" className="text-base" />
                  </>
                }
              />
            ))}
        </ListGroup>
      )}
    </div>
  )
}
