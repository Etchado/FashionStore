import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WishlistProvider, useWishlist } from '@/context/WishlistContext'

// Mock Supabase — tests run without a real DB
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [] }) }),
      upsert: () => Promise.resolve({}),
      delete: () => ({ eq: () => ({ eq: () => Promise.resolve({}) }) }),
    }),
  },
}))

// Mock AuthContext — no logged-in user
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

beforeEach(() => localStorage.clear())

const wrapper = ({ children }) => <WishlistProvider>{children}</WishlistProvider>

describe('WishlistContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    expect(result.current.ids).toHaveLength(0)
    expect(result.current.count).toBe(0)
  })

  it('adds a product', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => { await result.current.toggle('p1') })
    expect(result.current.ids).toContain('p1')
    expect(result.current.count).toBe(1)
  })

  it('removes a product on second toggle', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => { await result.current.toggle('p1') })
    await act(async () => { await result.current.toggle('p1') })
    expect(result.current.ids).not.toContain('p1')
    expect(result.current.count).toBe(0)
  })

  it('toggle returns true when adding', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    let added
    await act(async () => { added = await result.current.toggle('p1') })
    expect(added).toBe(true)
  })

  it('toggle returns false when removing', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => { await result.current.toggle('p1') })
    let removed
    await act(async () => { removed = await result.current.toggle('p1') })
    expect(removed).toBe(false)
  })

  it('isWishlisted returns correct boolean', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => { await result.current.toggle('p1') })
    expect(result.current.isWishlisted('p1')).toBe(true)
    expect(result.current.isWishlisted('p99')).toBe(false)
  })

  it('persists to localStorage', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => { await result.current.toggle('p1') })
    const stored = JSON.parse(localStorage.getItem('wishlist') || '[]')
    expect(stored).toContain('p1')
  })
})
