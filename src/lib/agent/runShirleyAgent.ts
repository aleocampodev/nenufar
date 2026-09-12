import type { Payload } from 'payload'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { executeShirleyTool } from './tools'
import {
  confirmationService,
  nenufarMcpServer,
  setMcpContext,
  takePendingConfirmation,
} from './nenufarMcp'
import { toolInventoryPrompt } from './toolRegistry'

export interface RunShirleyAgentArgs {
  /** Mensaje de texto de Shirley. */
  text: string
  /** Instancia de Payload Local API para las tools. */
  payload: Payload
  /** chat_id de Telegram (contexto; ya validado como admin en el webhook). */
  chatId: number
  userName?: string
  /** ID de medio cargado si el mensaje incluía foto */
  mediaId?: number
}

/** Mensaje de cortesía ante caída del gateway/timeout — jamás un stack trace a Telegram. */
export const AGENT_FALLBACK =
  'Shirley, tuve un inconveniente conectando con el servicio. Puedes revisar directamente en /admin mientras tanto 💜'

/** Límite de rondas agénticas. */
const MAX_TURNS = 4

/** Timeout por consulta agéntica completa (2 minutos para operaciones complejas). */
const TIMEOUT_MS = 120_000

/** Ventana máxima de mensajes previos para memoria conversacional. */
const MAX_HISTORY_MESSAGES = 4

/** Tope de caracteres del preámbulo de historial (los más recientes ganan). */
const HISTORY_MAX_CHARS = 2000

/** Tiempo de vida de una confirmación pendiente antes de cancelarse sola. */
const PENDING_TTL_MS = 5 * 60_000

/** Tope invisible de tamaño para no quemar tokens en entradas largas. */
const INPUT_MAX_CHARS = 1000

/** Presupuesto diario (Groq gpt-oss-120b free: 200K TPD). */
const DAILY_WARN_TOKENS = 150_000
const DAILY_PARK_TOKENS = 190_000

/** Circuit breaker ante saturación sostenida del tier gratuito. */
const CIRCUIT_FAIL_THRESHOLD = 3
const CIRCUIT_BREAKER_MS = 5 * 60_000

// Single-instance in-memory guards (same criterion as webhook dedupe:
// sufficient for the current single-node deployment, never a billing risk
// since the only caller is the single-admin Telegram webhook).
// HITL pending confirmations live in the shared MCP store (nenufarMcp.ts)
// so both the pre-query block here and the destructive MCP tool gates
// resolve the same pending action.
let circuitOpenUntil = 0
let consecutiveGatewayFailures = 0

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function buildSystemPrompt(): string {
  return [
    'Eres el asistente de gestión de Nénufar, la marca de joyería artesanal en Cartagena, Colombia.',
    'Tu interlocutora es Shirley, dueña, diseñadora artesanal y administradora de la tienda, quien te escribe desde Telegram.',
    'Dirígete siempre a ella únicamente como Shirley. Está ESTRICTAMENTE PROHIBIDO usar apelativos como "amor", "reina", "mi cielo", "corazón", "cariño", "linda", etc. Siempre trátala con respeto profesional, calidez y solo llamándola Shirley.',
    'Shirley no tiene conocimientos técnicos: NUNCA menciones IDs internos de bases de datos, números de registro con numeral (#8, ID Evento, etc.), colecciones, slugs o términos de código. Habla siempre de sus joyas, talleres, ferias y pedidos de forma natural y clara.',
    '',
    'Tono: cálido, respetuoso y cartagenero, pero profesional y eficiente. Respuestas directas para Telegram. Español.',
    '',
    'Reglas de negocio:',
    '- Precios siempre en pesos colombianos con símbolo $ y sin decimales (ej. $ 45.000). Nunca muestres la abreviatura COP.',
    '- Nunca inventes datos: si necesitas información del catálogo o pedidos, usa las herramientas disponibles.',
    `- Herramientas disponibles: ${toolInventoryPrompt()}.`,
    '- Acciones destructivas (confirmarPedido, eliminarEvento, eliminarFotoGaleria, eliminarTestimonio): la herramienta te pedirá confirmación; transmite la pregunta a Shirley y espera su "sí" antes de continuar.',
    '- Si una herramienta falla, discúlpate brevemente y sugiere intentar en un momento. No muestres errores técnicos ni IDs.',
    '- Si el mensaje es una pregunta general o saludo, responde directo sin usar herramientas.',
    '- Tienes acceso al historial de conversación previo: úsalo para entender referencias a productos, fotos o temas hablados anteriormente.',
    '',
    'Reglas de Copywriting para Marketing y Ventas (ALTA CONVERSIÓN · ANTI-SLOP · ANTI-SYCOPHANCY):',
    '- ENFOQUE DE MARKETING Y VENTAS DIRECTAS: El objetivo de cada texto comercial es convertir visitantes en compradoras. Despierta deseo genuino, vincula características técnicas a beneficios tangibles (ej. ligereza extrema que permite usar aretes de impacto 10 horas seguidas sin dolor), derriba objeciones (cero níquel para pieles reactivas, resistencia al sudor, empaque de regalo) y cierra con llamados a la acción claros.',
    '- PROHIBIDO EL AI SLOP Y CLICHÉS DE IA: No uses fórmulas vacías como "eleva tu estilo al siguiente nivel", "un tapiz de emociones", "sinfonía de colores", "en un mundo donde...", "déjate cautivar", "fusión mágica de lo ancestral y lo contemporáneo" ni adjetivos inflados.',
    '- PROHIBIDO EL SYCOPHANCY (adulación servil o complaciente): Jamás adules a Shirley ni a las clientas con lisonjas exageradas ("¡maravillosa reina!", "¡obra maestra divina!", "¡eres genial!"). El tono debe ser cálido pero sobrio, profesional y con la dignidad de quien domina un oficio manual.',
    '- ANCLADO EN EL OFICIO REAL: Basa cada argumento de venta en hechos tangibles: micro-mostacilla checa calibrada Preciosa Ornela que conserva su brillo, tejido punto por punto con hilo técnico resistente a la humedad del Caribe, ligereza extrema (menos de 15g que no jala las orejas ni cansa el cuello), remates limpios hipoalergénicos y confección pausada en Getsemaní, Cartagena.',
  ].join('\n')
}

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | Array<Record<string, any>>
}

/**
 * Carga el historial de conversación reciente para dar memoria contextual al agente.
 */
async function loadRecentHistory(
  payload: Payload,
  chatId: number,
): Promise<AnthropicMessage[]> {
  try {
    const result = await payload.find({
      collection: 'agent-messages' as any,
      where: {
        chatId: { equals: chatId },
      },
      sort: '-createdAt',
      limit: MAX_HISTORY_MESSAGES,
      overrideAccess: true,
    })

    if (!result.docs || result.docs.length === 0) {
      return []
    }

    // Orden cronológico (más antiguo al más reciente)
    const chronologicalDocs = [...result.docs].reverse()
    const history: AnthropicMessage[] = []

    for (const doc of chronologicalDocs) {
      if (doc.role === 'user' || doc.role === 'assistant') {
        const textContent = typeof doc.content === 'string' ? doc.content.trim() : ''
        if (textContent) {
          history.push({
            role: doc.role,
            content: textContent,
          })
        }
      }
    }

    return history
  } catch (err) {
    payload.logger.warn({
      msg: '[shirley-agent] No se pudo cargar historial conversacional, continuando sin memoria previa',
      err: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}

/**
 * Guarda un mensaje en la colección de historial de Supabase.
 */
async function persistMessage(
  payload: Payload,
  data: {
    chatId: number
    role: 'user' | 'assistant' | 'tool'
    content?: string
    toolName?: string
    toolCalls?: any
    toolResults?: any
  },
): Promise<void> {
  try {
    await payload.create({
      collection: 'agent-messages' as any,
      data: {
        chatId: data.chatId,
        role: data.role,
        content: data.content,
        toolName: data.toolName,
        toolCalls: data.toolCalls,
        toolResults: data.toolResults,
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.warn({
      msg: '[shirley-agent] Error persistiendo mensaje en historial',
      err: err instanceof Error ? err.message : String(err),
    })
  }
}

/**
 * Registra una traza de ejecución para auditoría y observabilidad en Supabase.
 */
async function recordTrace(
  payload: Payload,
  data: {
    chatId: number
    query: string
    responseSummary?: string
    toolsUsed?: string
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
    cost?: string
    executionTimeMs: number
    status: 'success' | 'error' | 'fallback'
    errorMessage?: string
    model?: string
  },
): Promise<void> {
  try {
    await payload.create({
      collection: 'agent-traces' as any,
      data: {
        chatId: data.chatId,
        query: data.query,
        responseSummary: data.responseSummary,
        toolsUsed: data.toolsUsed,
        inputTokens: data.inputTokens ?? 0,
        outputTokens: data.outputTokens ?? 0,
        totalTokens: data.totalTokens ?? 0,
        cost: data.cost ?? '$0 USD (Groq Free Tier)',
        executionTimeMs: data.executionTimeMs,
        status: data.status,
        errorMessage: data.errorMessage,
        model: data.model,
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.warn({
      msg: '[shirley-agent] Error registrando traza de observabilidad',
      err: err instanceof Error ? err.message : String(err),
    })
  }
}

/**
 * Suma los tokens consumidos hoy (UTC, ventana de reset de Groq) leyendo
 * agent-traces. Base del presupuesto diario invisible.
 */
/** L1 cache so every Telegram message does not scan 2000 traces. */
let budgetCache: { total: number; at: number } | null = null
const BUDGET_CACHE_TTL_MS = 60_000

export async function getDailyTokenUsage(
  payload: Payload,
): Promise<{ total: number; lite: boolean; parked: boolean }> {
  try {
    const now = Date.now()
    let total: number
    if (budgetCache && now - budgetCache.at < BUDGET_CACHE_TTL_MS) {
      total = budgetCache.total
    } else {
      const start = new Date()
      start.setUTCHours(0, 0, 0, 0)
      const result = await payload.find({
        collection: 'agent-traces' as any,
        where: {
          createdAt: { greater_than_equal: start.toISOString() },
        },
        pagination: false,
        limit: 2000,
        overrideAccess: true,
      })
      total = (result.docs || []).reduce(
        (acc: number, doc: any) => acc + Number(doc?.totalTokens || 0),
        0,
      )
      budgetCache = { total, at: now }
    }
    return {
      total,
      lite: total >= DAILY_WARN_TOKENS,
      parked: total >= DAILY_PARK_TOKENS,
    }
  } catch (err) {
    payload.logger.warn({
      msg: '[shirley-agent] No se pudo calcular el consumo diario, continuando sin presupuesto',
      err: err instanceof Error ? err.message : String(err),
    })
    return { total: 0, lite: false, parked: false }
  }
}

/** Mensaje cálido cuando la cuota gratuita del día se agota. */
export const DAILY_PARK_MESSAGE =
  'Shirley, por hoy agoté mi cuota gratuita del servicio. Puedes trabajar desde /admin y mañana seguimos normal 💜'

/** Mensaje cálido cuando el gateway gratuito está saturado temporalmente. */
export const CIRCUIT_BUSY_MESSAGE =
  'Shirley, el servicio gratuito está saturado por unos minutos. Si es urgente revísalo en /admin y ya retomamos 💜'

/** Date (UTC) of the last park alert sent to the channel — at most one per day. */
let lastParkAlertDate = ''

/**
 * Alerts the operations channel the first time the bot parks for the day,
 * so the quota exhaustion is visible without reading the DB. Fire-and-forget:
 * an alert failure must never break the user reply.
 */
async function alertParkedOncePerDay(totalTokens: number): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10)
    if (lastParkAlertDate === today) return
    lastParkAlertDate = today
    const { sendTelegramMessage } = await import('@/lib/telegram')
    await sendTelegramMessage({
      text:
        `⚠️ <b>Nénufar bot parqueado por cuota diaria</b>\n` +
        `Consumo estimado hoy: ${totalTokens} tokens (tope ${DAILY_PARK_TOKENS}).\n` +
        `Revisar límites de Groq / GOOGLE_API_KEY. El servicio sigue en /admin.`,
    })
  } catch {
    // Non-fatal by design.
  }
}

/**
 * Corre una consulta agéntica completa y devuelve el texto final para enviar
 * por Telegram. Usa el Claude Agent SDK real (query() + MCP in-process) con
 * LiteLLM :4000 como puerta hacia Groq. Nunca lanza: ante cualquier fallo
 * devuelve AGENT_FALLBACK.
 */
export async function runShirleyAgent({
  text,
  payload,
  chatId,
  mediaId,
}: RunShirleyAgentArgs): Promise<string> {
  const startTime = Date.now()
  const model = process.env.ANTHROPIC_MODEL || 'nenufar-bot'

  const cleanPrompt = (() => {
    const trimmed = text.trim().slice(0, INPUT_MAX_CHARS)
    if (trimmed === '/start' || trimmed === '/iniciar') {
      return 'Hola, soy Shirley. ¿Cómo estás y en qué me puedes ayudar hoy en la tienda?'
    }
    if (trimmed === '/help' || trimmed === '/ayuda') {
      return '¿Qué herramientas y tareas puedes hacer por mí en la tienda?'
    }
    if (trimmed.startsWith('/')) {
      return trimmed.replace(/^\/+/, '')
    }
    return trimmed
  })()

  const isResetCommand =
    text.trim() === '/start' ||
    text.trim() === '/iniciar' ||
    text.trim() === '/reiniciar' ||
    text.trim() === '/reset'

  if (isResetCommand) {
    takePendingConfirmation(chatId)
  }

  // 0a. Circuit breaker: ante saturación sostenida no se queman tokens.
  if (Date.now() < circuitOpenUntil) {
    return CIRCUIT_BUSY_MESSAGE
  }

  // 0b. Presupuesto diario invisible (ventana UTC de Groq).
  const dailyUsage = await getDailyTokenUsage(payload)
  if (dailyUsage.parked) {
    void recordTrace(payload, {
      chatId,
      query: text,
      responseSummary: DAILY_PARK_MESSAGE,
      toolsUsed: 'ninguna',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: '$0 USD (Groq Free Tier)',
      executionTimeMs: Date.now() - startTime,
      status: 'fallback',
      errorMessage: `daily-budget-parked (${dailyUsage.total} tokens)`,
      model,
    })
    void alertParkedOncePerDay(dailyUsage.total)
    return DAILY_PARK_MESSAGE
  }
  const liteMode = dailyUsage.lite
  const effectiveMaxTurns = liteMode ? 1 : MAX_TURNS

  // 0c. HITL: resolver una confirmación pendiente antes de cualquier llamada.
  // El pendiente lo pudo guardar un tool destructivo del MCP (que pide el
  // "sí" en vez de ejecutar) o un turno anterior.
  if (!isResetCommand) {
    const resolution = confirmationService.resolve(chatId, cleanPrompt)
    if (resolution.status === 'confirmed') {
      const pending = resolution.pending
      const confirmedArgs = { ...pending.args, ...(mediaId ? { mediaId } : {}) }
      const resultText = await executeShirleyTool(pending.toolName, confirmedArgs, payload)
      void persistMessage(payload, {
        chatId,
        role: 'assistant',
        content: resultText,
        toolName: pending.toolName,
      })
      void recordTrace(payload, {
        chatId,
        query: text,
        responseSummary: resultText,
        toolsUsed: pending.toolName,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: '$0 USD (Groq Free Tier)',
        executionTimeMs: Date.now() - startTime,
        status: 'success',
        model,
      })
      return resultText
    } else if (resolution.status === 'cancelled') {
      const cancelReply = 'Entendido Shirley, lo dejé como estaba, no eliminé ni cambié nada 💜'
      void persistMessage(payload, { chatId, role: 'assistant', content: cancelReply })
      void recordTrace(payload, {
        chatId,
        query: text,
        responseSummary: cancelReply,
        toolsUsed: 'ninguna',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: '$0 USD (Groq Free Tier)',
        executionTimeMs: Date.now() - startTime,
        status: 'fallback',
        errorMessage: 'HITL: confirmation-cancelled by Shirley',
        model,
      })
      return cancelReply
    }
    // expired / superseded / none: fall through to the regular agent turn.
    // (A superseded pending was already consumed — never tedious.)
  }

  // 1. Memoria previa de Supabase (o sesión limpia si envió /start).
  // En modo lite se omite el historial para ahorrar tokens de entrada.
  const historyMessages = isResetCommand || liteMode ? [] : await loadRecentHistory(payload, chatId)
  const system = buildSystemPrompt()
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')
  const apiKey =
    process.env.ANTHROPIC_AUTH_TOKEN || process.env.LITELLM_MASTER_KEY || 'sk-nenufar-local'

  // Persistir mensaje del usuario
  void persistMessage(payload, {
    chatId,
    role: 'user',
    content: text,
  })

  // 2. Armar el prompt con historial como preámbulo (el SDK maneja su propia
  // memoria de turnos dentro de la consulta; el historial persistido entra
  // como contexto de solo lectura, acotado para no contaminar todos los
  // turnos futuros con una sola respuesta larga).
  const historyPreamble = historyMessages
    .map((m) => `${m.role === 'user' ? 'Shirley' : 'Asistente'}: ${typeof m.content === 'string' ? m.content : ''}`)
    .join('\n')
    .slice(-HISTORY_MAX_CHARS)
  const mediaNote = mediaId
    ? `\n[Shirley adjuntó una foto ya guardada en Media con id ${mediaId}. La gestión de galería por ahora se hace desde /admin.]`
    : ''
  const fullPrompt = `${historyPreamble ? `Conversación previa:\n${historyPreamble}\n\n` : ''}Mensaje actual de Shirley: ${cleanPrompt}${mediaNote}`

  console.log(`⏱️ [agent-sdk] Iniciando query() (${Date.now() - startTime}ms, model=${model})`)

  // 3. Loop agéntico REAL vía Claude Agent SDK. El SDK hace spawn del CLI con
  // ANTHROPIC_BASE_URL apuntando a LiteLLM :4000, que traduce a Groq free.
  // tools: [] desactiva los built-ins (Bash/Read/Edit) — solo nuestras MCP.
  setMcpContext({ payload, chatId, ...(mediaId ? { mediaId } : {}) })
  const toolsInvoked: string[] = []
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let finalReply = ''
  let sdkError = ''

  try {
    const q = query({
      prompt: fullPrompt,
      options: {
        systemPrompt: system,
        model: liteMode ? 'nenufar-bot-20b' : model,
        maxTurns: effectiveMaxTurns,
        mcpServers: { 'nenufar-tienda': nenufarMcpServer },
        allowedTools: ['mcp__nenufar-tienda__*'],
        tools: [],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        cwd: '/tmp',
        env: {
          ...process.env as Record<string, string>,
          ANTHROPIC_BASE_URL: baseUrl,
          ANTHROPIC_AUTH_TOKEN: apiKey,
        },
      },
    })

    const collect = (async () => {
      for await (const msg of q) {
        if (msg.type === 'assistant') {
          const blocks = (msg.message.content ?? []) as Array<Record<string, any>>
          for (const block of blocks) {
            if (block?.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
              finalReply = block.text.trim()
            }
            if (block?.type === 'tool_use' && typeof block.name === 'string') {
              if (!toolsInvoked.includes(block.name)) toolsInvoked.push(block.name)
            }
          }
        } else if (msg.type === 'result') {
          if (msg.subtype === 'success') {
            if (typeof msg.result === 'string' && msg.result.trim()) {
              finalReply = msg.result.trim()
            }
            const usage = msg.usage as any
            totalInputTokens += Number(usage?.input_tokens ?? 0)
            totalOutputTokens += Number(usage?.output_tokens ?? 0)
          } else {
            sdkError = (msg as any).errors?.join('; ') ?? msg.subtype
          }
        }
      }
      return 'done' as const
    })()

    const outcome = await Promise.race([
      collect,
      sleep(TIMEOUT_MS).then(() => 'timeout' as const),
    ])
    if (outcome === 'timeout') {
      await q.interrupt().catch(() => undefined)
      throw new Error('TimeoutError')
    }

    consecutiveGatewayFailures = 0

    if (!finalReply) {
      payload.logger.warn({ msg: '[shirley-agent-sdk] query() sin texto final, usando fallback' })
      void recordTrace(payload, {
        chatId,
        query: text,
        responseSummary: AGENT_FALLBACK,
        toolsUsed: toolsInvoked.join(', ') || 'ninguna',
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        cost: '$0 USD (Groq Free Tier)',
        executionTimeMs: Date.now() - startTime,
        status: 'fallback',
        errorMessage: sdkError || 'query() sin respuesta textual',
        model,
      })
      return AGENT_FALLBACK
    }

    void persistMessage(payload, {
      chatId,
      role: 'assistant',
      content: finalReply,
      toolName: toolsInvoked.join(', ') || undefined,
    })
    void recordTrace(payload, {
      chatId,
      query: text,
      responseSummary: finalReply,
      toolsUsed: toolsInvoked.join(', ') || 'ninguna',
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      cost: '$0 USD (Groq Free Tier)',
      executionTimeMs: Date.now() - startTime,
      status: 'success',
      model,
    })
    return finalReply
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    consecutiveGatewayFailures++
    if (consecutiveGatewayFailures >= CIRCUIT_FAIL_THRESHOLD) {
      circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_MS
    }
    payload.logger.error({
      msg: '[shirley-agent-sdk] Error crítico en query() del SDK',
      err: errorMsg,
    })
    void recordTrace(payload, {
      chatId,
      query: text,
      responseSummary: AGENT_FALLBACK,
      toolsUsed: toolsInvoked.join(', ') || 'ninguna',
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      cost: '$0 USD (Groq Free Tier)',
      executionTimeMs: Date.now() - startTime,
      status: 'error',
      errorMessage: errorMsg,
      model,
    })
    return AGENT_FALLBACK
  }
}
