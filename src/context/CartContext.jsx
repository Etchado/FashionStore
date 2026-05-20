import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

function load() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, variant, qty = 1) => {
    setItems(prev => {
      const key = `${product.id}-${variant?.id || 'default'}`
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        key,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image,
        price: variant?.price ?? product.price,
        variantId: variant?.id,
        variantLabel: variant?.label,
        qty,
      }]
    })
    setOpen(true)
  }

  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key))

  const updateQty = (key, qty) => {
    if (qty < 1) return removeItem(key)
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  }

  const clearCart = () => setItems([])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const value = useMemo(
    () => ({ items, count, subtotal, open, setOpen, addItem, removeItem, updateQty, clearCart }),
    [items, count, subtotal, open]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
