import { useEffect, useMemo } from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { isReconciliationEnabled } from '@/features/balance'
import {
  buildTransaction,
  validateDraft,
  validateExchangeRate,
} from '@/features/transaction/transactionForm'
import { createId, toDatetimeLocalValue } from '@/lib'
import {
  useCurrencyStore,
  useTransactionDraftStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
import type {
  RepeatConfig,
  Transaction,
  TransactionType,
  Wallet,
} from '@/types/domain'

import type { TransactionPageProps } from './TransactionPage'

function useTransactionPageRouting() {
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const {
    id,
    sourceId,
    date: repeatDate,
  } = useParams()
  const existing = useTransactionStore((state) => (id
    ? state.findById(id)
    : undefined))
  const sourceRepeat = useTransactionStore((state) => (sourceId
    ? state.findById(sourceId)
    : undefined))
  const [searchParams] = useSearchParams()

  const isEditMode = Boolean(id && existing)
  const isRepeatMaterialization = Boolean(sourceId && repeatDate)
  const initial = isRepeatMaterialization
    ? sourceRepeat
    : existing
  const seedCategoryId = !isEditMode && !isRepeatMaterialization
    ? searchParams.get('categoryId') ?? undefined
    : undefined
  const seedType = !isEditMode && !isRepeatMaterialization
    ? (searchParams.get('type') ?? 'expense') as TransactionType
    : undefined
  const seedDate = !isEditMode && !isRepeatMaterialization
    ? searchParams.get('date') ?? undefined
    : undefined

  return {
    navigate,
    backNavigate,
    existing,
    isEditMode,
    isRepeatMaterialization,
    initial,
    seedCategoryId,
    seedType,
    seedDate,
    repeatDate,
  }
}

function useTransactionPageDraft(
  existing: Transaction | undefined,
  initial: Transaction | undefined,
  seedType: TransactionType | undefined,
  seedCategoryId: string | undefined,
  seedDate: string | undefined,
  wallets: TransactionPageProps['wallets'],
) {
  const draftStore = useTransactionDraftStore()
  const updateDraft = draftStore.update
  const clearDraft = draftStore.clear

  const initialType = (seedType ?? initial?.type ?? 'expense') as TransactionType
  const initialWalletId = initial?.walletId ?? wallets[0]?.id ?? 'wallet-cash'

  const initialDraft = useMemo(() => ({
    id: existing?.id,
    type: initialType,
    walletId: initialWalletId,
    toWalletId: initial?.toWalletId ?? wallets.find((w) => w.id !== initialWalletId)?.id,
    items: initial?.items ?? (seedCategoryId
      ? [{ categoryId: seedCategoryId, amount: 0 }]
      : []),
    focusedIndex: seedCategoryId
      ? 0
      : null,
    date: initial
      ? toDatetimeLocalValue(new Date(initial.date))
      : seedDate
        ? toDatetimeLocalValue(new Date(`${seedDate}T00:00`))
        : toDatetimeLocalValue(new Date()),
    note: initial?.note ?? '',
    currency: initial?.currency ?? wallets.find((w) => w.id === initialWalletId)?.currency ?? 'THB',
    exchangeRate: String(initial?.exchangeRate ?? ''),
    toExchangeRate: String(initial?.toExchangeRate ?? ''),
    repeatConfig: initial?.repeat ?? { preset: 'never' },
    transferAmount: initial?.type === 'transfer'
      ? initial.items[0]?.amount ?? 0
      : 0,
    cleared: existing?.cleared ?? false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  useEffect(() => {
    if (!draftStore.draft) {
      useTransactionDraftStore.getState().init(initialDraft)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const draft = draftStore.draft ?? initialDraft

  return {
    draft,
    updateDraft,
    clearDraft,
  }
}

type UseTransactionSaveHandlerOptions = {
  draft: ReturnType<typeof useTransactionPageDraft>['draft']
  wallet: Wallet | undefined
  wallets: Wallet[]
  defaultRate: string
  isPlanned: boolean
  isRepeatMaterialization: boolean
  repeatDate: string | undefined
  existing: Transaction | undefined
  isEditMode: boolean
  add: (transaction: Transaction) => Promise<void>
  update: (transaction: Transaction) => Promise<void>
  clearDraft: () => void
  navigate: ReturnType<typeof useNavigate>
}

function useTransactionSaveHandler({
  draft,
  wallet,
  wallets,
  defaultRate,
  isPlanned,
  isRepeatMaterialization,
  repeatDate,
  existing,
  isEditMode,
  add,
  update,
  clearDraft,
  navigate,
}: UseTransactionSaveHandlerOptions) {
  return async function onSave() {
    const {
      type,
      walletId,
      toWalletId,
      items,
      transferAmount,
      currency,
      exchangeRate,
      toExchangeRate,
      date,
      repeatConfig,
      note,
      cleared,
    } = draft

    const errors = validateDraft({
      type,
      walletId,
      toWalletId,
      items,
      transferAmount,
    })
    if (currency !== wallet?.currency) {
      const rateError = validateExchangeRate(exchangeRate || defaultRate)
      if (rateError) {
        errors.push(rateError)
      }
    }
    if (type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency) {
      const rateError = validateExchangeRate(toExchangeRate || defaultRate)
      if (rateError) {
        errors.push(rateError)
      }
    }
    if (errors.length > 0) {
      alert(errors[0])

      return
    }
    const markedPaid = isRepeatMaterialization
      ? true
      : !isPlanned
    const transaction = buildTransaction({
      id: existing?.id,
      type,
      walletId,
      toWalletId,
      currency,
      items,
      transferAmount,
      exchangeRate: currency !== wallet?.currency
        ? Number(exchangeRate || defaultRate)
        : undefined,
      toExchangeRate: type === 'transfer'
        ? Number(toExchangeRate || defaultRate)
        : undefined,
      date: isRepeatMaterialization && repeatDate
        ? `${repeatDate}T00:00`
        : date,
      markedPaid,
      repeat: repeatConfig.preset === 'never'
        ? undefined
        : repeatConfig,
      note,
      cleared,
      now: existing?.createdAt ?? new Date().toISOString(),
      createId,
    })
    if (isEditMode) {
      await update(transaction)
    } else {
      await add(transaction)
    }
    clearDraft()
    navigate('/')
  }
}

function useTransactionDeleteHandler(
  existing: Transaction | undefined,
  remove: (id: string) => Promise<void>,
  clearDraft: () => void,
  navigate: ReturnType<typeof useNavigate>,
) {
  return async function onDelete() {
    if (!existing) {
      return
    }
    if (!window.confirm('Delete this transaction?')) {
      return
    }
    await remove(existing.id)
    clearDraft()
    navigate('/')
  }
}

export function useTransactionPage(): TransactionPageProps {
  const {
    navigate,
    backNavigate,
    existing,
    isEditMode,
    isRepeatMaterialization,
    initial,
    seedCategoryId,
    seedType,
    seedDate,
    repeatDate,
  } = useTransactionPageRouting()

  const wallets = useWalletStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)
  const add = useTransactionStore((state) => state.add)
  const update = useTransactionStore((state) => state.update)
  const remove = useTransactionStore((state) => state.remove)

  const {
    draft, updateDraft, clearDraft,
  } = useTransactionPageDraft(
    existing,
    initial,
    seedType,
    seedCategoryId,
    seedDate,
    wallets,
  )

  const {
    type,
    walletId,
    toWalletId,
    items,
    focusedIndex,
    date,
    note,
    currency,
    exchangeRate,
    toExchangeRate,
    repeatConfig,
    transferAmount,
    cleared,
  } = draft

  const selectedCurrency = currencies.find((item) => item.code === currency)
  const defaultRate = selectedCurrency?.rate
    ? String(selectedCurrency.rate)
    : ''
  const isPlanned = new Date(date) > new Date()
  const wallet = wallets.find((item) => item.id === walletId)
  const walletReconciliationEnabled = wallet
    ? isReconciliationEnabled(wallet)
    : false

  const onSave = useTransactionSaveHandler({
    draft,
    wallet,
    wallets,
    defaultRate,
    isPlanned,
    isRepeatMaterialization,
    repeatDate,
    existing,
    isEditMode,
    add,
    update,
    clearDraft,
    navigate,
  })

  const onDelete = useTransactionDeleteHandler(existing, remove, clearDraft, navigate)

  return {
    type,
    walletId,
    toWalletId,
    items,
    focusedIndex,
    date,
    note,
    currency,
    exchangeRate,
    toExchangeRate,
    repeatConfig,
    transferAmount,
    wallets,
    currencies,
    isEditMode,
    isPlanned,
    defaultRate,
    cleared,
    walletReconciliationEnabled,
    onToggleCleared: () => updateDraft({ cleared: !cleared }),
    onChangeType: (v: TransactionType) => updateDraft({
      type: v,
      items: [],
      focusedIndex: null,
    }),
    onUpdateExchangeRate: (value: string) => updateDraft({ exchangeRate: value }),
    onUpdateToExchangeRate: (value: string) => updateDraft({ toExchangeRate: value }),
    onUpdateDate: (d: Date) => updateDraft({ date: toDatetimeLocalValue(d) }),
    onUpdateNote: (value: string) => updateDraft({ note: value }),
    onFocusNoteField: () => updateDraft({ focusedIndex: null }),
    onUpdateRepeatConfig: (config: RepeatConfig) => updateDraft({ repeatConfig: config }),
    onUpdateWallet: (id: string) => updateDraft({ walletId: id }),
    onUpdateToWallet: (id: string) => updateDraft({ toWalletId: id }),
    onUpdateCurrency: (code: string) => updateDraft({ currency: code }),
    onFocusItem: (index: number) => updateDraft({ focusedIndex: index }),
    onRemoveItem: (index: number) => updateDraft({ items: items.filter((_, i) => i !== index) }),
    onChangeCategory: (index: number) => navigate(`/transaction/category?changingIndex=${index}&type=${type}`),
    onAddCategory: () => navigate(`/transaction/category?addCategory=true&type=${type}`),
    onPressCalcKey: (_key: string, result: number) => type === 'transfer'
      ? updateDraft({ transferAmount: result })
      : updateDraft({
        items: items.map((item, index) => (index === focusedIndex
          ? { ...item, amount: result }
          : item)),
      }),
    onOpenCurrencyPicker: () => { /* handled in dumb component */ },
    onSave,
    onBack: () => {
      clearDraft()
      backNavigate('/')
    },
    onDelete,
    onDismissKeyboard: () => updateDraft({ focusedIndex: null }),
  }
}
