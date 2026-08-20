import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de Groq (sin red) y del cliente de Telegram. vi.hoisted permite
// referenciar estos mocks dentro de las factories de vi.mock.
const { createMock, sendTelegramMessage } = vi.hoisted(() => ({
  createMock: vi.fn(),
  sendTelegramMessage: vi.fn(),
}))

vi.mock('@/lib/groq', () => ({
  getGroq: () => ({ chat: { completions: { create: createMock } } }),
  GROQ_MODEL: 'test-model',
}))

vi.mock('@/lib/telegram', () => ({ sendTelegramMessage }))

import { runAgent } from '@/lib/agents/runtime'
import { routeAndRun } from '@/lib/agents/orchestrator'
import { catalogoAgent } from '@/lib/agents/catalogo'
import { conversacionAgent } from '@/lib/agents/conversacion'

// Helper: arma una respuesta estilo Groq/OpenAI.
function assistant(content: string | null, toolCalls?: unknown[]) {
  return { choices: [{ message: { role: 'assistant', content, tool_calls: toolCalls } }] }
}
function toolCall(name: string, args: Record<string, unknown>) {
  return { id: `call_${name}`, type: 'function', function: { name, arguments: JSON.stringify(args) } }
}

const fakePayload = {
  find: vi.fn(async () => ({
    docs: [{ id: 1, title: 'Aretes de plata', slug: 'aretes-de-plata', priceInCOP: 90000 }],
  })),
  logger: { info: vi.fn(), error: vi.fn() },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const ctx = { payload: fakePayload, chatId: 123, userName: 'Ana' }

beforeEach(() => {
  createMock.mockReset()
  fakePayload.find.mockClear()
  sendTelegramMessage.mockReset()
  sendTelegramMessage.mockResolvedValue({ ok: true, messageId: 1 })
})

describe('runAgent — loop de tool-calling', () => {
  it('el agente Catálogo ejecuta buscarProductos y responde con el resultado', async () => {
    createMock
      .mockResolvedValueOnce(assistant(null, [toolCall('buscarProductos', { consulta: 'aretes' })]))
      .mockResolvedValueOnce(assistant('Tenemos Aretes de plata disponibles.'))

    const reply = await runAgent(catalogoAgent, 'quiero aretes', ctx)

    expect(fakePayload.find).toHaveBeenCalledOnce()
    expect(reply).toContain('Aretes de plata')
  })

  it('el agente Conversación deriva a Shirley (handoff) al querer personalizar', async () => {
    createMock
      .mockResolvedValueOnce(
        assistant(null, [toolCall('derivarAShirley', { resumen: 'quiere personalizar un anillo' })]),
      )
      .mockResolvedValueOnce(assistant('Le pasé tus datos a Shirley, ella te contactará.'))

    const reply = await runAgent(conversacionAgent, 'quiero personalizar un anillo', ctx)

    expect(sendTelegramMessage).toHaveBeenCalledOnce()
    expect(reply).toContain('Shirley')
  })
})

describe('routeAndRun — orquestador', () => {
  it('enruta preguntas de producto al agente Catálogo', async () => {
    createMock
      .mockResolvedValueOnce(assistant('catalogo')) // router
      .mockResolvedValueOnce(assistant('¿Qué pieza buscas?')) // agente (sin tools)

    const res = await routeAndRun('¿tienen collares?', ctx)
    expect(res.agent).toBe('catalogo')
  })

  it('enruta el resto al agente Conversación (default)', async () => {
    createMock
      .mockResolvedValueOnce(assistant('conversacion'))
      .mockResolvedValueOnce(assistant('¡Hola! ¿En qué te ayudo?'))

    const res = await routeAndRun('hola', ctx)
    expect(res.agent).toBe('conversacion')
  })
})
