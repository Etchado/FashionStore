import { createContext, useContext, useState } from 'react'

const CompareContext = createContext(null)

export function CompareProvider({ children }) {
  const [items, setItems] = useState([])

  const toggle = (product) => {
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id)
      }
      if (prev.length >= 3) return prev
      return [...prev, product]
    })
  }

  const isComparing = (id) => items.some(p => p.id === id)
  const clear = () => setItems([])

  return (
    <CompareContext.Provider value={{ items, toggle, isComparing, clear, count: items.length }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => useContext(CompareContext)
