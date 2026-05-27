const currencySymbols: Record<string, string> = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

export function formatAmount(amount: number, currency = 'THB', locale?: string): string {
  const code = currency?.trim() || 'THB'
  const symbol = currencySymbols[code] ?? code

  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return `${symbol}${formatted}`
  } catch {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return `${symbol}${formatted}`
  }
}

export function formatSignedAmount(amount: number, currency: string): string {
  const formatted = formatAmount(Math.abs(amount), currency)
  if (amount < 0) {
    return `(${formatted})`
  }

  return formatted
}
export function formatFocusedAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    return ''
  }

  return Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
