import { describe, it, expect } from 'vitest'
import { TELEGRAM_MESSAGE_MAX_LENGTH, splitTelegramMessage, formatTelegramHtml } from '@/lib/telegram'

describe('splitTelegramMessage (Telegram 4096 hard cap)', () => {
  it('returns short messages untouched', () => {
    expect(splitTelegramMessage('Hola Shirley 💜', 4000)).toEqual(['Hola Shirley 💜'])
  })

  it('splits long texts on newline boundaries within the cap', () => {
    const line = 'x'.repeat(1000)
    const text = [line, line, line, line, line].join('\n')
    const parts = splitTelegramMessage(text, TELEGRAM_MESSAGE_MAX_LENGTH)
    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(TELEGRAM_MESSAGE_MAX_LENGTH)
    }
    expect(parts.join('\n')).toBe(text)
  })

  it('hard-cuts a single oversized line as a last resort', () => {
    const text = 'y'.repeat(TELEGRAM_MESSAGE_MAX_LENGTH + 500)
    const parts = splitTelegramMessage(text, TELEGRAM_MESSAGE_MAX_LENGTH)
    expect(parts).toHaveLength(2)
    expect(parts.join('')).toBe(text)
  })

  it('keeps a normal order message in a single part', () => {
    const lines = ['🔔 <b>Nuevo pedido — Nenúfar</b>', '🎫 Pedido: <code>#1</code>']
    for (let i = 0; i < 20; i++) lines.push(`Item ${i} — $ 45.000`)
    const parts = splitTelegramMessage(lines.join('\n'), TELEGRAM_MESSAGE_MAX_LENGTH)
    expect(parts).toHaveLength(1)
  })
})

describe('formatTelegramHtml (Telegram message sanitization and formatting)', () => {
  it('converts markdown asterisks to clean Telegram HTML bold and strips leftover asterisks', () => {
    const input = '¡Hola!\n**Categorías del catálogo**\n- **clientas** (momentos) **'
    const result = formatTelegramHtml(input)
    expect(result).not.toContain('**')
    expect(result).toContain('<b>Categorías del catálogo</b>')
    expect(result).toContain('<b>clientas</b>')
  })

  it('preserves existing valid Telegram HTML tags while escaping invalid tags and reserved characters', () => {
    const input = '🔔 <b>Nuevo pedido</b> & precio < $ 50.000 <customTag>'
    const result = formatTelegramHtml(input)
    expect(result).toContain('<b>Nuevo pedido</b>')
    expect(result).toContain('&amp;')
    expect(result).toContain('&lt;')
  })

  it('converts markdown headers and code blocks properly', () => {
    const input = '### Evento en Cartagena\nDetalle: `aretes-loto`'
    const result = formatTelegramHtml(input)
    expect(result).toContain('<b>Evento en Cartagena</b>')
    expect(result).toContain('<code>aretes-loto</code>')
  })
})
