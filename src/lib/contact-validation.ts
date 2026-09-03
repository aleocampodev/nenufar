/**
 * Validates Colombian/international WhatsApp contact numbers (E.164 compatible, min 10 digits).
 */
export function validateWhatsAppContact(phone: string): { ok: boolean; reason?: string } {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  const digitsOnly = cleaned.replace(/^\+/, '')
  if (!/^\+?\d{10,15}$/.test(cleaned) || digitsOnly.length < 10) {
    return {
      ok: false,
      reason: 'Por favor ingresá un número de WhatsApp válido (ej. 321 456 7890 o 10 dígitos).',
    }
  }
  return { ok: true }
}

/**
 * Normalizes a contact number to E.164 format (+57...) for database and Telegram storage.
 */
export function normalizeWhatsAppContact(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  if (cleaned.startsWith('57') && cleaned.length === 12) {
    return `+${cleaned}`
  }
  if (cleaned.length === 10) {
    return `+57${cleaned}`
  }
  return `+${cleaned}`
}

