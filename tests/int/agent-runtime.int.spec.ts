import { describe, expect, it, vi } from 'vitest'

/**
 * Tests del runtime del bot de Shirley (Claude Agent SDK).
 * Se mockea `query()` del SDK: sin red ni gateway.
 */
const queryMock = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: queryMock,
  tool: vi.fn(),
  createSdkMcpServer: vi.fn(() => ({ name: 'mock-server' })),
}))

import { AGENT_FALLBACK, runShirleyAgent } from '@/lib/agent/runShirleyAgent'

const fakePayload = {
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
} as unknown as Parameters<typeof runShirleyAgent>[0]['payload']

function successResult(text: string) {
  return async function* () {
    yield { type: 'result', subtype: 'success', is_error: false, result: text }
  }
}

describe('runShirleyAgent', () => {
  it('devuelve el texto final cuando el SDK responde con éxito', async () => {
    queryMock.mockImplementation(() => successResult('Tienes 2 pedidos pendientes 💜')())
    const reply = await runShirleyAgent({
      text: '¿qué pedidos tengo pendientes?',
      payload: fakePayload,
      chatId: 123,
    })
    expect(reply).toBe('Tienes 2 pedidos pendientes 💜')
    // El prompt llega al SDK y las tools quedan pre-aprobadas vía whitelist.
    const options = queryMock.mock.calls[0][0].options
    expect(options.maxTurns).toBe(4)
    expect(options.allowedTools).toContain('mcp__nenufar-tienda__pedidosPendientes')
  })

  it('devuelve el fallback de cortesía cuando el SDK lanza (gateway caído)', async () => {
    queryMock.mockImplementation(() => {
      throw new Error('ECONNREFUSED localhost:4000')
    })
    const reply = await runShirleyAgent({ text: 'pedidos', payload: fakePayload, chatId: 123 })
    expect(reply).toBe(AGENT_FALLBACK)
    expect(fakePayload.logger.error).toHaveBeenCalled()
  })

  it('devuelve el fallback cuando el resultado es error_max_turns', async () => {
    queryMock.mockImplementation(async function* () {
      yield { type: 'result', subtype: 'error_max_turns', is_error: true }
    }())
    const reply = await runShirleyAgent({ text: 'hola', payload: fakePayload, chatId: 123 })
    expect(reply).toBe(AGENT_FALLBACK)
  })
})
