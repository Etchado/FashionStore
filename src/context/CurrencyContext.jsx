import { createContext, useContext, useState } from 'react'
import { CURRENCIES, formatPrice } from '@/lib/currencies'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('currency') || 'USD'
  )

  const changeCurrency = (code) => {
    setCurrency(code)
    localStorage.setItem('currency', code)
  }

  const format = (amount) => formatPrice(amount, currency)

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, format, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
