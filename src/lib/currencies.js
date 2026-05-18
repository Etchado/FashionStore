export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',       rate: 1 },
  { code: 'EUR', symbol: '€',  name: 'Euro',             rate: 0.92 },
  { code: 'GBP', symbol: '£',  name: 'British Pound',    rate: 0.79 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',      rate: 3.67 },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal',      rate: 3.75 },
]

export function formatPrice(amount, currency) {
  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  const converted = amount * cur.rate
  if (currency === 'AED' || currency === 'SAR') {
    return `${converted.toFixed(0)} ${cur.symbol}`
  }
  return `${cur.symbol}${converted.toFixed(2)}`
}
