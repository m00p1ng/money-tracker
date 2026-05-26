import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import {
  buildTransactionRowDisplay,
  toLocalDateKey,
} from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
import type { UpcomingTransactionRow } from '@/stores/transactionStore'
import type { Transaction } from '@/types/domain'

import type { DayIndicator } from './components/CalendarGrid/CalendarGrid'

export type CalendarRowData = {
  key: string
  to: string
  icon: string
  title: string
  date: string
  amount: number
  currency: string
  amountColor: string
}

function todayDateKey(): string {
  return toLocalDateKey(new Date().toISOString())
}

export function useCalendarPage() {
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const now = new Date()
  const todayKey = todayDateKey()

  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey)

  const transactionsByMonth = useTransactionStore((state) => state.transactionsByMonth)
  const upcomingByMonth = useTransactionStore((state) => state.upcomingByMonth)
  const findCategory = useCategoryStore((state) => state.findById)
  const wallets = useWalletStore((state) => state.items)
  const findWallet = useWalletStore((state) => state.findById)

  const monthTransactions = transactionsByMonth(currentYear, currentMonth).filter((tx) => tx.type !== 'adjustment')
  const monthUpcoming = upcomingByMonth(currentYear, currentMonth)

  const indicatorMap: Record<string, DayIndicator> = {}
  for (const tx of monthTransactions) {
    const key = toLocalDateKey(tx.date)
    indicatorMap[key] = 'transaction'
  }
  for (const row of monthUpcoming) {
    indicatorMap[row.date] = indicatorMap[row.date] === 'transaction'
      ? 'both'
      : 'upcoming'
  }

  function makeRealRow(tx: Transaction, date: string): CalendarRowData {
    return {
      key: tx.id,
      ...buildTransactionRowDisplay({
        transaction: tx,
        findCategory,
        wallets,
        date,
      }),
    }
  }

  function makeUpcomingRow(row: UpcomingTransactionRow, date: string): CalendarRowData {
    const tx = row.kind === 'real'
      ? row.transaction
      : row.occurrence.transaction
    const firstItem = tx.items[0]
    const category = firstItem
      ? findCategory(firstItem.categoryId)
      : undefined
    const fromWallet = findWallet(tx.walletId)
    const toWallet = tx.toWalletId
      ? findWallet(tx.toWalletId)
      : undefined
    const title =
      tx.type === 'transfer'
        ? `${fromWallet?.name ?? 'Wallet'} → ${toWallet?.name ?? 'Wallet'}`
        : category?.name ?? 'Transaction'
    const to =
      row.kind === 'real'
        ? `/transaction/${tx.id}`
        : `/transaction/repeat/${row.occurrence.sourceId}/${row.occurrence.occurrenceDate}`

    return {
      key: row.id,
      to,
      icon: tx.type === 'transfer'
        ? 'fa-right-left'
        : category?.icon ?? 'fa-clock',
      title,
      date,
      amount: firstItem?.amount ?? 0,
      currency: tx.currency,
      amountColor: 'text-amber-400',
    }
  }

  const listRows: CalendarRowData[] = selectedDate
    ? [
      ...monthTransactions
        .filter((tx) => toLocalDateKey(tx.date) === selectedDate)
        .map((tx) => makeRealRow(
          tx,
          selectedDate,
        )),
      ...monthUpcoming
        .filter((row) => row.date === selectedDate)
        .map((row) =>
          makeUpcomingRow(
            row,
            row.date,
          ),
        ),
    ]
    : (() => {
      const realEntries = monthTransactions.map((tx) => ({
        dateKey: toLocalDateKey(tx.date),
        row: makeRealRow(tx, toLocalDateKey(tx.date)),
      }))
      const upcomingEntries = monthUpcoming.map((row) => ({
        dateKey: row.date,
        row: makeUpcomingRow(row, row.date),
      }))

      return [...realEntries, ...upcomingEntries]
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .map(({ row }) => row)
    })()

  function onSelectDate(date: string | null) {
    setSelectedDate(date)
  }

  function onPrev() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  function onNext() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  function onAdd() {
    navigate(`/transaction/new?date=${selectedDate ?? todayKey}`)
  }

  function onBack() {
    backNavigate('/')
  }

  return {
    currentYear,
    currentMonth,
    today: todayKey,
    selectedDate,
    indicatorMap,
    listRows,
    onSelectDate,
    onPrev,
    onNext,
    onAdd,
    onBack,
    onSearch: () => { },
  }
}
