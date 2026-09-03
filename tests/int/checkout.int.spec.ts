import { describe, it, expect, beforeEach } from 'vitest'
import { validateWhatsAppContact, normalizeWhatsAppContact } from '@/lib/contact-validation'
import { validateConsent } from '@/lib/consent'
import {
  generateIdempotencyKey,
  checkIdempotency,
  markSeen,
  _resetForTesting,
} from '@/lib/idempotency'

describe('Checkout Subsystem Hardening (IP-002 / SPEC-001)', () => {
  beforeEach(() => {
    _resetForTesting()
  })

  describe('WhatsApp Contact Validation & Normalization', () => {
    it('accepts valid 10-digit mobile numbers', () => {
      const result = validateWhatsAppContact('3214567890')
      expect(result.ok).toBe(true)
    })

    it('accepts valid Colombian numbers with country code (+57)', () => {
      const result = validateWhatsAppContact('+57 321 456 7890')
      expect(result.ok).toBe(true)
    })

    it('accepts numbers with spaces, dashes, or parentheses', () => {
      const result = validateWhatsAppContact('(321) 456-7890')
      expect(result.ok).toBe(true)
    })

    it('rejects short numbers with fewer than 10 digits', () => {
      const result = validateWhatsAppContact('12345')
      expect(result.ok).toBe(false)
      expect(result.reason).toContain('número de WhatsApp válido')
    })

    it('rejects letters and special characters', () => {
      const result = validateWhatsAppContact('no-phone-here')
      expect(result.ok).toBe(false)
    })

    it('normalizes local 10-digit numbers to E.164 +57 prefix for database storage', () => {
      expect(normalizeWhatsAppContact('321 456 7890')).toBe('+573214567890')
      expect(normalizeWhatsAppContact('3214567890')).toBe('+573214567890')
      expect(normalizeWhatsAppContact('+57 321 456 7890')).toBe('+573214567890')
      expect(normalizeWhatsAppContact('573214567890')).toBe('+573214567890')
    })
  })

  describe('Habeas Data Consent Guard (Ley 1581)', () => {
    it('accepts on, true, or 1', () => {
      expect(validateConsent('on').ok).toBe(true)
      expect(validateConsent(true).ok).toBe(true)
      expect(validateConsent('true').ok).toBe(true)
      expect(validateConsent(1).ok).toBe(true)
    })

    it('rejects missing or unchecked consent', () => {
      const result = validateConsent(undefined)
      expect(result.ok).toBe(false)
      expect(result.reason).toContain('Ley 1581')
    })
  })

  describe('SHA256 Idempotency Protection', () => {
    it('prevents double submission of the same cart with the same contact', () => {
      const cartId = 'cart-test-101'
      const contact = '+57 300 987 6543'
      const orderId = 'order-test-555'

      // First check: allowed
      expect(checkIdempotency(cartId, contact).allowed).toBe(true)

      // Mark order registered
      markSeen(cartId, orderId, contact)

      // Duplicate check: blocked with orderId
      const check2 = checkIdempotency(cartId, contact)
      expect(check2.allowed).toBe(false)
      expect(check2.existingOrderId).toBe(orderId)
    })

    it('generates uniform SHA256 hashes regardless of phone formatting', () => {
      const hash1 = generateIdempotencyKey('cart-1', '+57 321 456 7890')
      const hash2 = generateIdempotencyKey('cart-1', '+573214567890')
      expect(hash1).toBe(hash2)
    })
  })
})
