/**
 * Idempotency — duplicate "Send order" clicks must NOT produce two Telegram
 * messages or two Orders. Constitution §2.10, PRD §3.5.
 *
 * Strategy: in-memory Set of recently-seen cartIds with TTL.
 * Sufficient for single-instance MVP (Vercel hobby = 1 instance).
 * For multi-instance deployments, swap to Vercel KV or Upstash Redis.
 *
 * Window: 10 minutes. After that, a retry is allowed (covers genuine retries
 * after network failures).
 */

const IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

interface SeenEntry {
  cartId: string
  expiresAt: number
  orderId: string
}

const seen = new Map<string, SeenEntry>()

// Periodic cleanup — runs on every check
function cleanupExpired(): void {
  const now = Date.now()
  for (const [key, entry] of seen) {
    if (entry.expiresAt < now) {
      seen.delete(key)
    }
  }
}

export interface IdempotencyCheckResult {
  /** true = first submission (proceed). false = duplicate (return cached response). */
  allowed: boolean
  /** When allowed=false, the orderId from the first successful submission. */
  existingOrderId?: string
}

/**
 * Checks if this cartId has been submitted recently.
 * Does NOT register the cartId — call markSeen() only after the Order is actually created.
 */
export function checkIdempotency(cartId: string): IdempotencyCheckResult {
  cleanupExpired()
  const entry = seen.get(cartId)
  if (entry && entry.expiresAt > Date.now()) {
    return { allowed: false, existingOrderId: entry.orderId }
  }
  return { allowed: true }
}

/**
 * Registers a successful submission. Call this AFTER the Telegram message is sent
 * AND the Order is created in Payload. This way, if the operation fails mid-way,
 * a genuine retry is allowed.
 */
export function markSeen(cartId: string, orderId: string): void {
  seen.set(cartId, {
    cartId,
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
