import { describe, it, expect } from 'vitest'
import { GOLD, LOYALTY_TIERS, ORDER_STATUSES } from '@/lib/constants'

describe('constants', () => {
  it('GOLD is a CSS gradient string', () => {
    expect(GOLD).toContain('linear-gradient')
    expect(GOLD).toContain('#ecc46e')
  })

  it('LOYALTY_TIERS are in ascending order', () => {
    const mins = LOYALTY_TIERS.map(t => t.min)
    expect(mins).toEqual([...mins].sort((a, b) => a - b))
  })

  it('LOYALTY_TIERS starts at 0', () => {
    expect(LOYALTY_TIERS[0].min).toBe(0)
  })

  it('ORDER_STATUSES contains expected states', () => {
    expect(ORDER_STATUSES).toContain('pending')
    expect(ORDER_STATUSES).toContain('paid')
    expect(ORDER_STATUSES).toContain('delivered')
    expect(ORDER_STATUSES).toContain('cancelled')
  })
})

describe('order number format', () => {
  it('generates unique IDs', () => {
    const generate = () => `AU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
    const a = generate()
    const b = generate()
    expect(a).toMatch(/^AU-[A-F0-9]{8}$/)
    expect(a).not.toBe(b)
  })
})
