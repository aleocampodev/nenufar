import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(),
  createSdkMcpServer: vi.fn((opts: any) => ({ name: opts?.name ?? 'mock', tools: opts?.tools ?? [] })),
  tool: vi.fn((name: string, _desc: string, _schema: any, handler: any) => ({ name, handler })),
}))

import { query } from '@anthropic-ai/claude-agent-sdk'
import { AGENT_FALLBACK, runShirleyAgent } from '@/lib/agent/runShirleyAgent'

const mockedQuery = query as unknown as ReturnType<typeof vi.fn>

const fakePayload = {
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  find: vi.fn(async () => ({ docs: [] })),
  findByID: vi.fn(async () => null),
  update: vi.fn(async () => ({})),
  create: vi.fn(async () => ({ id: 99 })),
} as unknown as Parameters<typeof runShirleyAgent>[0]['payload']

function asyncMessages(messages: any[]) {
  return (async function* () {
    for (const m of messages) yield m
  })() as any
}

describe('runShirleyAgent (Claude Agent SDK via LiteLLM)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve el texto final cuando query() responde con éxito', async () => {
    mockedQuery.mockReturnValueOnce(
      asyncMessages([
        {
          type: 'assistant',
          message: { content: [{ type: 'text', text: 'Tienes 2 pedidos pendientes 💜' }] },
        },
        { type: 'result', subtype: 'success', result: 'Tienes 2 pedidos pendientes 💜', usage: {} },
      ]),
    )

    const reply = await runShirleyAgent({
      text: '¿qué pedidos tengo pendientes?',
      payload: fakePayload,
      chatId: 123,
    })

    expect(reply).toBe('Tienes 2 pedidos pendientes 💜')
    expect(mockedQuery).toHaveBeenCalledOnce()
    const callArg = mockedQuery.mock.calls[0][0] as any
    expect(callArg.options.mcpServers).toHaveProperty('nenufar-tienda')
    expect(callArg.options.env.ANTHROPIC_BASE_URL).toContain('4000')
    expect(callArg.options.tools).toEqual([])
  })

  it('registra las tools invocadas y devuelve el texto del result', async () => {
    mockedQuery.mockReturnValueOnce(
      asyncMessages([
        {
          type: 'assistant',
          message: {
            content: [{ type: 'tool_use', id: 'call_1', name: 'pedidosPendientes', input: {} }],
          },
        },
        {
          type: 'result',
          subtype: 'success',
          result: 'No tienes pedidos pendientes. Todo al día 💜',
          usage: {},
        },
      ]),
    )

    const reply = await runShirleyAgent({
      text: 'pedidos',
      payload: fakePayload,
      chatId: 123,
    })

    expect(reply).toContain('No tienes pedidos pendientes')
    expect(mockedQuery).toHaveBeenCalledTimes(1)
  })

  it('devuelve el fallback de cortesía cuando query() lanza', async () => {
    mockedQuery.mockImplementationOnce(() => {
      throw new Error('ECONNREFUSED localhost:4000')
    })

    const reply = await runShirleyAgent({ text: 'hola', payload: fakePayload, chatId: 123 })
    expect(reply).toBe(AGENT_FALLBACK)
    expect(fakePayload.logger.error).toHaveBeenCalled()
  })

  it('registry: MCP server, prompt inventory y set destructivo coinciden', async () => {
    const reg = await import('@/lib/agent/toolRegistry')
    const mcp = await import('@/lib/agent/nenufarMcp')
    const server = mcp.nenufarMcpServer as unknown as { tools: Array<{ name: string }> }
    const mcpNames = server.tools.map((t) => t.name).sort()
    const regNames = reg.SHIRLEY_TOOL_DEFINITIONS.map((t) => t.name).sort()
    expect(mcpNames).toEqual(regNames)
    expect(mcpNames).toHaveLength(23)
    expect([...mcp.MCP_DESTRUCTIVE_TOOLS].sort()).toEqual([...reg.destructiveToolNames()].sort())
    const inventory = reg.toolInventoryPrompt()
    for (const name of regNames) {
      expect(inventory).toContain(name)
    }
  })

  it('HITL: confirmarPedido pide confirmación y el "sí" la ejecuta', async () => {
    const mcp = await import('@/lib/agent/nenufarMcp')
    const server = mcp.nenufarMcpServer as unknown as {
      tools: Array<{ name: string; handler: (args: any) => Promise<any> }>
    }
    const confirmar = server.tools.find((t) => t.name === 'confirmarPedido')
    expect(confirmar).toBeDefined()

    mcp.setMcpContext({ payload: fakePayload, chatId: 777 })
    const gateReply = await confirmar!.handler({ pedidoId: 5 })
    const gateText = gateReply.content[0].text as string
    expect(gateText).toContain('confirmar')
    expect(gateText).toContain('sí')
    expect(mcp.peekPendingConfirmation(777)?.toolName).toBe('confirmarPedido')

    // Shirley responde "sí" → el bloque pre-query ejecuta el pendiente sin llamar al SDK
    const reply = await runShirleyAgent({ text: 'sí', payload: fakePayload, chatId: 777 })
    expect(reply).toContain('No encontré el pedido #5')
    expect(mcp.peekPendingConfirmation(777)).toBeUndefined()
    expect(mockedQuery).not.toHaveBeenCalled()
  })

  it('HITL: "no" cancela la confirmación pendiente', async () => {
    const mcp = await import('@/lib/agent/nenufarMcp')
    mcp.setMcpContext({ payload: fakePayload, chatId: 888 })
    const server = mcp.nenufarMcpServer as unknown as {
      tools: Array<{ name: string; handler: (args: any) => Promise<any> }>
    }
    const eliminar = server.tools.find((t) => t.name === 'eliminarEvento')
    await eliminar!.handler({ titulo: 'Feria del Dulce' })
    expect(mcp.peekPendingConfirmation(888)?.toolName).toBe('eliminarEvento')

    const reply = await runShirleyAgent({ text: 'no, mejor no', payload: fakePayload, chatId: 888 })
    expect(reply).toContain('lo dejé como estaba')
    expect(mcp.peekPendingConfirmation(888)).toBeUndefined()
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
    expect(res).toContain('tejida a mano')
  })

  it('ejecuta generarCopyLanding para hero y cta', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const heroRes = await executeShirleyTool(
      'generarCopyLanding',
      { seccion: 'hero', enfoque: 'colección caribeña' },
      fakePayload,
    )
    expect(heroRes).toContain('Hero Principal')
    expect(heroRes).toContain('Joyería en mostacilla tejida a mano en Cartagena')

    const ctaRes = await executeShirleyTool(
      'generarCopyLanding',
      { seccion: 'cta' },
      fakePayload,
    )
    expect(ctaRes).toContain('Pedidos Personalizados')
  })

  it('ejecuta crearCategoria y listarCategorias correctamente', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const mockPayload = {
      ...fakePayload,
      find: vi
        .fn()
        // First find (in findOrCreateCategory): empty -> creates new
        .mockResolvedValueOnce({ docs: [] })
        // Second find (in listarCategorias): returns categories
        .mockResolvedValueOnce({ docs: [{ id: 10, title: 'Tobilleras', slug: 'tobilleras' }] })
        // Third find (counting products for Tobilleras)
        .mockResolvedValueOnce({ docs: [], totalDocs: 3 }),
      create: vi.fn().mockResolvedValueOnce({ id: 10, title: 'Tobilleras', slug: 'tobilleras' }),
    } as any

    const createRes = await executeShirleyTool(
      'crearCategoria',
      { titulo: 'Tobilleras' },
      mockPayload,
    )
    expect(createRes).toContain('Tobilleras')
    expect(createRes).toContain('creada exitosamente')

    const listRes = await executeShirleyTool('listarCategorias', {}, mockPayload)
    expect(listRes).toContain('Tobilleras (3 joyas)')
  })

  it('ejecuta asignarCategoriaProducto asociando la categoría al producto', async () => {
    const { executeShirleyTool } = await import('@/lib/agent/tools')
    const mockPayload = {
      ...fakePayload,
      find: vi
        .fn()
        // find product by slug
        .mockResolvedValueOnce({ docs: [{ id: 1, title: 'Aretes Sol', slug: 'aretes-sol' }] })
        // find category (in findOrCreateCategory)
        .mockResolvedValueOnce({ docs: [{ id: 5, title: 'Aretes', slug: 'aretes' }] }),
      findByID: vi.fn().mockResolvedValueOnce({ id: 1, title: 'Aretes Sol', categories: [] }),
      update: vi.fn().mockResolvedValueOnce({ id: 1 }),
    } as any

    const res = await executeShirleyTool(
      'asignarCategoriaProducto',
      { slug: 'aretes-sol', categoria: 'Aretes' },
      mockPayload,
    )

    expect(res).toContain('Asocié la categoría "Aretes" a la joya "Aretes Sol"')
    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        id: 1,
        data: { categories: [5] },
      }),
    )
  })
})
