import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateIdempotencyKey,
  checkIdempotency,
  markSeen,
  _resetForTesting,
  IDEMPOTENCY_WINDOW_MS,
} from '@/lib/idempotency'

describe('Idempotency Subsystem (Constitution Art. V § 3)', () => {
  beforeEach(() => {
    _resetForTesting()
  })

  it('has a 5-minute TTL window', () => {
    expect(IDEMPOTENCY_WINDOW_MS).toBe(5 * 60 * 1000)
  })

  it('generates deterministic SHA256 hex keys', () => {
    const key1 = generateIdempotencyKey('cart_123', '+57 300 123 4567')
    const key2 = generateIdempotencyKey('cart_123', '+573001234567')
    const key3 = generateIdempotencyKey('cart_456', '+57 300 123 4567')

    // Should normalize whitespace and yield exact 64-char hex
    expect(key1).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(key1)).toBe(true)
    expect(key1).toBe(key2)
    expect(key1).not.toBe(key3)
  })

  it('allows first submission and detects duplicate submissions', () => {
    const cartId = 'cart_abc'
    const phone = '3214567890'
    const orderId = 'order_999'

    // Initial check: allowed
    const firstCheck = checkIdempotency(cartId, phone)
    expect(firstCheck.allowed).toBe(true)
    expect(firstCheck.existingOrderId).toBeUndefined()

    // Mark as seen
    markSeen(cartId, orderId, phone)

    // Immediate second check: duplicate rejected
    const secondCheck = checkIdempotency(cartId, phone)
    expect(secondCheck.allowed).toBe(false)
    expect(secondCheck.existingOrderId).toBe(orderId)

    // Different cart: allowed
    const otherCartCheck = checkIdempotency('cart_xyz', phone)
    expect(otherCartCheck.allowed).toBe(true)
  })
})
