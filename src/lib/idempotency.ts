import { createHash } from 'crypto'

/**
 * Idempotency — duplicate "Send order" clicks must NOT produce duplicate
 * Telegram notifications or double Orders in Payload.
 *
 * Constitution Art. V § 3:
 * In-memory SHA256 hash window of 5 minutes (cartId + buyerContact).
 */

export const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

interface SeenEntry {
  key: string
  expiresAt: number
  orderId: string
}

const seen = new Map<string, SeenEntry>()

// Periodic cleanup of expired keys
function cleanupExpired(): void {
  const now = Date.now()
  for (const [key, entry] of seen) {
    if (entry.expiresAt < now) {
      seen.delete(key)
    }
  }
}

/**
 * Generates a deterministic SHA256 idempotency key from cartId and buyerContact.
 */
export function generateIdempotencyKey(cartId: string, buyerContact: string = ''): string {
  const normalizedContact = buyerContact.replace(/\s+/g, '').toLowerCase()
  const payload = `${cartId.trim()}:${normalizedContact}`
  return createHash('sha256').update(payload).digest('hex')
}

export interface IdempotencyCheckResult {
  /** true = first submission (proceed). false = duplicate submission. */
  allowed: boolean
  /** When allowed=false, the orderId from the first successful submission. */
  existingOrderId?: string
}

/**
 * Checks if this (cartId, buyerContact) pair has been submitted recently.
 * Does NOT register the key — call markSeen() only after the Order is safely created.
 */
export function checkIdempotency(cartId: string, buyerContact: string = ''): IdempotencyCheckResult {
  cleanupExpired()
  const key = generateIdempotencyKey(cartId, buyerContact)
  const entry = seen.get(key)
  if (entry && entry.expiresAt > Date.now()) {
    return { allowed: false, existingOrderId: entry.orderId }
  }
  return { allowed: true }
}

/**
 * Registers a successful submission. Call this AFTER the Order is created in Payload
 * and Telegram notification is initiated.
 */
export function markSeen(cartId: string, orderId: string, buyerContact: string = ''): void {
  const key = generateIdempotencyKey(cartId, buyerContact)
  seen.set(key, {
    key,
    orderId,
    expiresAt: Date.now() + IDEMPOTENCY_WINDOW_MS,
  })
}

/**
 * Test helper — clears all seen entries. Only use in tests.
 */
export function _resetForTesting(): void {
  seen.clear()
}

