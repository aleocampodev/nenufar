import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { AGENT_FALLBACK, runShirleyAgent } from '@/lib/agent/runShirleyAgent'

const fakePayload = {
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  find: vi.fn(async () => ({ docs: [] })),
  findByID: vi.fn(async () => null),
  update: vi.fn(async () => ({})),
  create: vi.fn(async () => ({ id: 99 })),
} as unknown as Parameters<typeof runShirleyAgent>[0]['payload']

describe('runShirleyAgent', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('devuelve el texto final cuando la API responde con éxito', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'Tienes 2 pedidos pendientes 💜' }],
        stop_reason: 'end_turn',
      }),
    } as any)

    const reply = await runShirleyAgent({
      text: '¿qué pedidos tengo pendientes?',
      payload: fakePayload,
      chatId: 123,
    })

    expect(reply).toBe('Tienes 2 pedidos pendientes 💜')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/messages'),
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('ejecuta herramientas (tool_use) y devuelve la respuesta del siguiente turno', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              type: 'tool_use',
              id: 'call_1',
              name: 'pedidosPendientes',
              input: {},
            },
          ],
          stop_reason: 'tool_use',
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ type: 'text', text: 'No tienes pedidos pendientes. Todo al día 💜' }],
          stop_reason: 'end_turn',
        }),
      } as any)

    const reply = await runShirleyAgent({
      text: 'pedidos',
      payload: fakePayload,
      chatId: 123,
    })

    expect(reply).toBe('No tienes pedidos pendientes. Todo al día 💜')
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('devuelve el fallback de cortesía cuando la API falla o lanza', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED localhost:4000'))

    const reply = await runShirleyAgent({ text: 'hola', payload: fakePayload, chatId: 123 })
    expect(reply).toBe(AGENT_FALLBACK)
    expect(fakePayload.logger.error).toHaveBeenCalled()
  })

  it('ejecuta generarCopyProducto y devuelve propuesta atractiva en español', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const res = await executeShirleyTool(
      'generarCopyProducto',
      {
        nombrePieza: 'Aretes Filigrana Atardecer',
        materialesOTecnica: 'filigrana momposina en plata',
        ocasionOEstilo: 'elegantes para eventos especiales',
      },
      fakePayload,
    )

    expect(res).toContain('Aretes Filigrana Atardecer')
    expect(res).toContain('Cartagena')
    expect(res).toContain('100% a mano')
  })

  it('ejecuta generarCopyLanding para hero y cta', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const heroRes = await executeShirleyTool(
      'generarCopyLanding',
      { seccion: 'hero', enfoque: 'colección caribeña' },
      fakePayload,
    )
    expect(heroRes).toContain('Carrusel Principal')
    expect(heroRes).toContain('Joyas Tejidas con Alma Caribeña')

    const ctaRes = await executeShirleyTool(
      'generarCopyLanding',
      { seccion: 'cta' },
      fakePayload,
    )
    expect(ctaRes).toContain('Personalizar mi Joya')
  })

  it('ejecuta generarPostRedes con hooks y llamado a la acción', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const res = await executeShirleyTool(
      'generarPostRedes',
      {
        redSocial: 'instagram',
        tema: 'Pechera Okama Ceremonial',
      },
      fakePayload,
    )

    expect(res).toContain('INSTAGRAM')
    expect(res).toContain('Pechera Okama Ceremonial')
    expect(res).toContain('#NenufarJoyería')
    expect(res).toContain('nenufar.co/shop')
  })
})
