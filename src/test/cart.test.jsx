import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from '@/context/CartContext'
import { useCart } from '@/context/CartContext'

// localStorage mock
beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

const PRODUCT = { id: 'p1', name: 'Bleu de Chanel', brand: 'Chanel', image: '', price: 185 }
const VARIANT = { id: 'p1-50', label: '50 ml', price: 185 }

describe('CartContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.count).toBe(0)
  })

  it('adds an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 1))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.count).toBe(1)
    expect(result.current.subtotal).toBe(185)
  })

  it('increments qty for duplicate item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 1))
    act(() => result.current.addItem(PRODUCT, VARIANT, 2))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.count).toBe(3)
    expect(result.current.subtotal).toBe(185 * 3)
  })

  it('removes an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 1))
    const key = result.current.items[0].key
    act(() => result.current.removeItem(key))
    expect(result.current.items).toHaveLength(0)
  })

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 2))
    act(() => result.current.clearCart())
    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 1))
    const key = result.current.items[0].key
    act(() => result.current.updateQty(key, 5))
    expect(result.current.count).toBe(5)
  })

  it('removes item when qty updated to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(PRODUCT, VARIANT, 1))
    const key = result.current.items[0].key
    act(() => result.current.updateQty(key, 0))
    expect(result.current.items).toHaveLength(0)
  })
})
