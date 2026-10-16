import { describe, it, expect } from 'vitest'
import {
  CONFIRM_RE,
  CANCEL_RE,
  PENDING_TTL_MS,
  confirmPromptText,
  createConfirmationService,
  createMemoryConfirmationStore,
  summarizeAction,
} from '@/lib/agent/confirmation'

function serviceAt(now: number) {
  let clock = now
  const svc = createConfirmationService(createMemoryConfirmationStore(), () => clock, PENDING_TTL_MS)
  return { svc, advance: (ms: number) => void (clock += ms) }
}

describe('Confirmation module (HITL policy)', () => {
  it('request stores the pending action and asks for sí/no', () => {
    const { svc } = serviceAt(1000)
    const prompt = svc.request(7, 'confirmarPedido', { pedidoId: 5 })
    expect(prompt).toContain('sí')
    expect(prompt).toContain('no')
    expect(svc.peek(7)?.toolName).toBe('confirmarPedido')
  })

  it('resolves natural confirmations, including accented sí', () => {
    for (const text of ['sí', 'si', 'sí por favor', 'confirmo', 'dale', 'ok', 'listo', 'listo!']) {
      const { svc } = serviceAt(1000)
      svc.request(7, 'confirmarPedido', { pedidoId: 5 })
      const res = svc.resolve(7, text)
      expect(res.status, text).toBe('confirmed')
      if (res.status === 'confirmed') {
        expect(res.pending.args).toEqual({ pedidoId: 5 })
      }
      expect(svc.peek(7)).toBeUndefined()
    }
  })

  it('does not confirm lookalikes like "silla"', () => {
    const { svc } = serviceAt(1000)
    svc.request(7, 'confirmarPedido', { pedidoId: 5 })
    expect(svc.resolve(7, 'silla').status).toBe('superseded')
  })

  it('resolves cancellations', () => {
    for (const text of ['no', 'cancela', 'mejor no', 'déjalo']) {
      const { svc } = serviceAt(1000)
      svc.request(7, 'eliminarEvento', { titulo: 'Feria' })
      expect(svc.resolve(7, text).status, text).toBe('cancelled')
      expect(svc.peek(7)).toBeUndefined()
    }
  })

  it('expires pendings after the TTL', () => {
    const { svc, advance } = serviceAt(1000)
    svc.request(7, 'confirmarPedido', { pedidoId: 5 })
    advance(PENDING_TTL_MS + 1)
    expect(svc.resolve(7, 'sí').status).toBe('expired')
    expect(svc.peek(7)).toBeUndefined()
  })

  it('supersedes on unrelated messages (never tedious)', () => {
    const { svc } = serviceAt(1000)
    svc.request(7, 'confirmarPedido', { pedidoId: 5 })
    expect(svc.resolve(7, '¿qué pedidos tengo?').status).toBe('superseded')
  })

  it('resolves none when nothing is pending', () => {
    const { svc } = serviceAt(1000)
    expect(svc.resolve(7, 'sí').status).toBe('none')
  })

  it('take consumes, peek does not', () => {
    const { svc } = serviceAt(1000)
    svc.request(7, 'confirmarPedido', { pedidoId: 5 })
    expect(svc.peek(7)?.toolName).toBe('confirmarPedido')
    expect(svc.take(7)?.toolName).toBe('confirmarPedido')
    expect(svc.take(7)).toBeUndefined()
  })

  it('summaries stay short for Telegram', () => {
    const summary = summarizeAction('actualizarInventario', { slug: 'x'.repeat(500) })
    expect(summary.length).toBeLessThanOrEqual(350)
    expect(confirmPromptText(summary)).toContain('5 minutos')
  })

  it('regexes accept the real-world spellings', () => {
    expect(CONFIRM_RE.test('sí')).toBe(true)
    expect(CANCEL_RE.test('no, mejor no')).toBe(true)
  })
})
