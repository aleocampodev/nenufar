/**
 * Consent validation — Ley 1581 de 2012 (Colombia data protection law).
 *
 * The order form requires EXPLICIT, ACTIVE consent before any PII is sent
 * to the Telegram channel. Constitution §2.11, PRD §3.6.
 *
 * Checkbox must be UNCHECKED by default; submission is blocked until checked.
 */

export interface ConsentValidationResult {
  ok: boolean
  reason?: string
}

/**
 * Validates the consent flag from the form submission.
 * `value` can be a boolean, string 'on', 'true', or undefined.
 */
export function validateConsent(value: unknown): ConsentValidationResult {
  const isConsented = value === true || value === 'on' || value === 'true' || value === 1

  if (!isConsented) {
    return {
      ok: false,
      reason:
        'Debes dar consentimiento explícito para enviar tus datos a Shirley. Ley 1581 de 2012.',
    }
  }

  return { ok: true }
}

/**
 * The consent text shown next to the checkbox.
 * Single source of truth — form UI and confirmation page both use this.
 */
export const CONSENT_TEXT =
  'Autorizo a Nénufar a enviar mis datos de contacto y mi pedido a Shirley para que me contacte. Tus datos no se comparten con terceros y se usan solo para procesar tu pedido. Ver política de privacidad.'

/**
 * The privacy notice URL — referenced in the consent text.
 */
export const PRIVACY_URL = '/privacidad'
