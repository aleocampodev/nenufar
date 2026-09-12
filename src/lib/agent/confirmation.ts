/**
 * Confirmation module — the single home of Shirley's HITL policy.
 *
 * Destructive tools never execute on the model's word alone: the gate stores
 * the pending action and asks Shirley for an explicit "sí". The answer
 * arrives as the next Telegram message and is resolved here, before any
 * model call.
 *
 * Depth lives behind a small interface (request/peek/resolve); the store is
 * an adapter (memory today, Payload/DB tomorrow — two adapters, one real
 * seam) and the clock is injectable so expiry is unit-testable without
 * Payload, Telegram, or the SDK.
 */

export interface PendingConfirmation {
  toolName: string
  args: Record<string, any>
  summary: string
  expiresAt: number
}

export interface ConfirmationStore {
  get(chatId: number): PendingConfirmation | undefined
  set(chatId: number, pending: PendingConfirmation): void
  delete(chatId: number): void
}

export function createMemoryConfirmationStore(): ConfirmationStore {
  const map = new Map<number, PendingConfirmation>()
  return {
    get: (chatId) => map.get(chatId),
    set: (chatId, pending) => void map.set(chatId, pending),
    delete: (chatId) => void map.delete(chatId),
  }
}

/** Relaxed natural-language confirmation (never tedious). */
export const CONFIRM_RE = /^(s[ií](\s+por favor)?|confirmo|dale|ok|yes|listo)(\s|[.,!?]|$)/i
export const CANCEL_RE = /^(no|cancela|mejor no|déjalo|dejalo)\b/i

export type Resolution =
  | { status: 'none' }
  | { status: 'expired' }
  | { status: 'confirmed'; pending: PendingConfirmation }
  | { status: 'cancelled' }
  | { status: 'superseded' }

export const PENDING_TTL_MS = 5 * 60_000

export function confirmPromptText(summary: string): string {
  return (
    `Shirley, antes de hacerlo quiero confirmar:\n${summary}\n\n` +
    `Respóndeme *sí* para confirmar o *no* para cancelar. (Se cancela solo en 5 minutos)`
  )
}

export function summarizeAction(toolName: string, args: Record<string, any>): string {
  return `• ${toolName} ${JSON.stringify(args).slice(0, 300)}`
}

export interface ConfirmationService {
  /** Store a pending action and build the question for Shirley. */
  request(chatId: number, toolName: string, args: Record<string, any>): string
  /** Look at the pending action without consuming it. */
  peek(chatId: number): PendingConfirmation | undefined
  /** Consume and return the pending action, if any (reset path). */
  take(chatId: number): PendingConfirmation | undefined
  /** Directly store a pending action (reset/test paths). */
  store(chatId: number, pending: PendingConfirmation): void
  /** Classify Shirley's next message against the pending action. */
  resolve(chatId: number, text: string): Resolution
}

export function createConfirmationService(
  store: ConfirmationStore = createMemoryConfirmationStore(),
  now: () => number = Date.now,
  ttlMs: number = PENDING_TTL_MS,
): ConfirmationService {
  return {
    request(chatId, toolName, args) {
      const summary = summarizeAction(toolName, args)
      store.set(chatId, { toolName, args, summary, expiresAt: now() + ttlMs })
      return confirmPromptText(summary)
    },
    peek(chatId) {
      return store.get(chatId)
    },
    take(chatId) {
      const pending = store.get(chatId)
      store.delete(chatId)
      return pending
    },
    store(chatId, pending) {
      store.set(chatId, pending)
    },
    resolve(chatId, text) {
      const pending = store.get(chatId)
      if (!pending) return { status: 'none' }
      if (now() > pending.expiresAt) {
        store.delete(chatId)
        return { status: 'expired' }
      }
      const clean = text.trim()
      if (CONFIRM_RE.test(clean)) {
        store.delete(chatId)
        return { status: 'confirmed', pending }
      }
      if (CANCEL_RE.test(clean)) {
        store.delete(chatId)
        return { status: 'cancelled' }
      }
      store.delete(chatId)
      return { status: 'superseded' }
    },
  }
}
