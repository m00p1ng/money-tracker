const currencySymbols: Record<string, string> = {
  THB: '฿',
}

export function formatAmount(amount: number, currency = 'THB'): string {
  const symbol = currencySymbols[currency] ?? currency
  return `${symbol}${amount.toFixed(2)}`
}
