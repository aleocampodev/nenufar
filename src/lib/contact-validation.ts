/**
 * Validates Colombian/international WhatsApp contact numbers (E.164 compatible, min 10 digits).
 */
export function validateWhatsAppContact(phone: string): { ok: boolean; reason?: string } {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  const digitsOnly = cleaned.replace(/^\+/, '')
  if (!/^\+?\d{10,15}$/.test(cleaned) || digitsOnly.length < 10) {
    return {
      ok: false,
      reason: 'Por favor ingresá un número de WhatsApp válido (ej. +57 300 123 4567 o 10 dígitos).',
    }
  }
  return { ok: true }
}
