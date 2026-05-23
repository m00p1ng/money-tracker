import { Card } from '@/components/ui/Card'
import { formatAmount } from '@/lib/format'
import type { TransactionType } from '@/types/domain'

export function AmountDisplay({ amount, expression, type }: { amount: number; expression: string; type: TransactionType }) {
  return (
    <Card className="relative">
      <span className="absolute right-4 top-4 rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">THB ฿</span>
      <p className={`pt-8 text-4xl font-semibold ${type === 'income' ? 'text-income' : 'text-expense'}`}>{formatAmount(amount)}</p>
      <p className="mt-2 min-h-5 text-sm text-slate-500">{expression}</p>
    </Card>
  )
}
