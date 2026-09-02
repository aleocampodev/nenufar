import type { Payload } from 'payload'
import { ANTHROPIC_SHIRLEY_TOOLS, executeShirleyTool } from './tools'

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

/** Timeout por petición al gateway. */
const TIMEOUT_MS = 40_000

/** Ventana máxima de mensajes previos para memoria conversacional. */
const MAX_HISTORY_MESSAGES = 10

function buildSystemPrompt(): string {
  return [
    'Eres el asistente de gestión de Nénufar, la marca de joyería artesanal en Cartagena, Colombia.',
    'Tu interlocutora es Shirley, dueña, diseñadora artesanal y administradora de la tienda, quien te escribe desde Telegram.',
    'Dirígete siempre a ella con cariño y respeto como Shirley.',
    '',
    'Tono: cálido, cercano y cartagenero, pero eficiente. Respuestas cortas (es Telegram). Español.',
    '',
    'Reglas de negocio:',
    '- Precios siempre en pesos colombianos (COP) sin decimales.',
    '- Nunca inventes datos: si necesitas información del catálogo, pedidos o la landing, usa las herramientas.',
    '- Si te preguntan qué productos hay, qué joyas vendemos o piden ver el catálogo, USA SIEMPRE la herramienta buscarProducto (con consulta vacía o palabra clave) para obtener la lista real de la base de datos.',
    '- Puedes crear productos en borrador o publicarlos de inmediato en la tienda web (/shop) si te lo pide (incluso asignando su categoría).',
    '- Puedes crear y listar categorías del catálogo con crearCategoria y listarCategorias.',
    '- Puedes asignar categorías a joyas existentes con asignarCategoriaProducto.',
    '- Puedes publicar o despublicar cualquier producto existente con la herramienta publicarProducto.',
    '- Si Shirley envía una foto y pide cambiar la foto de una sección de la landing (Tradición y Delicadeza o Nuestra Historia), usa actualizarFotoLanding.',
    '- Si Shirley envía un video y pide actualizar el video de ferias y talleres (o sección vivencial), usa actualizarVideoTaller.',
    '- Si Shirley envía una foto y pide agregar un slide o banner al carrusel de inicio, usa agregarSlideHero.',
    '- Si Shirley pide ver los slides del carrusel o eliminar uno, usa listarSlidesHero o eliminarSlideHero.',
    '- Si Shirley pide ideas de texto, descripciones atractivas para una joya o copys para el catálogo web (/products/[slug]), usa generarCopyProducto.',
    '- Si Shirley pide agendar un taller o feria, USA SIEMPRE publicarEvento.',
    '- Si Shirley pide ver, consultar o listar los talleres y ferias programados, USA SIEMPRE listarEventos para ver los datos reales.',
    '- Si Shirley pide eliminar o cancelar un taller o feria, USA SIEMPRE eliminarEvento.',
    '- Si una herramienta falla, discúlpate brevemente y sugiere revisar /admin. No muestres errores técnicos.',
    '- Si el mensaje es una pregunta general o saludo, responde directo sin usar herramientas.',
    '- Tienes acceso al historial de conversación previo: úsalo para entender referencias a productos, fotos o temas hablados anteriormente.',
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
 * Corre una consulta agéntica completa y devuelve el texto final para enviar
 * por Telegram. Nunca lanza: ante cualquier fallo devuelve AGENT_FALLBACK.
 */
export async function runShirleyAgent({
  text,
  payload,
  chatId,
  mediaId,
}: RunShirleyAgentArgs): Promise<string> {
  const startTime = Date.now()
  const toolsInvoked: string[] = []
  let totalInputTokens = 0
  let totalOutputTokens = 0

  const cleanPrompt = (() => {
    const trimmed = text.trim()
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

  // 1. Cargar memoria previa de Supabase (o iniciar sesión limpia si envió /start)
  const historyMessages = isResetCommand ? [] : await loadRecentHistory(payload, chatId)
  const system = buildSystemPrompt()
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')
  const apiKey =
    process.env.ANTHROPIC_AUTH_TOKEN || process.env.LITELLM_MASTER_KEY || 'sk-nenufar-local'
  const model = process.env.ANTHROPIC_MODEL || 'nenufar-bot'

  const messages: AnthropicMessage[] = [
    ...historyMessages,
    { role: 'user', content: cleanPrompt },
  ]

  // Persistir mensaje del usuario
  void persistMessage(payload, {
    chatId,
    role: 'user',
    content: text,
  })

    console.log(`⏱️ [agent] Iniciando consulta (${Date.now() - startTime}ms)`)
  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const turnStart = Date.now()
      console.log(`⏱️ [agent] Llamando a LiteLLM Turno ${turn + 1}...`)
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages,
          tools: ANTHROPIC_SHIRLEY_TOOLS,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      console.log(`⏱️ [agent] LiteLLM Turno ${turn + 1} respondió en ${Date.now() - turnStart}ms (status: ${response.status})`)

      if (!response.ok) {
        const errorText = await response.text()
        payload.logger.error({
          msg: '[shirley-agent] Error en llamada a Anthropic/LiteLLM',
          status: response.status,
          errorText,
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
          errorMessage: `HTTP ${response.status}: ${errorText}`,
          model,
        })

        return AGENT_FALLBACK
      }

      const data = await response.json()

      // Acumular conteo de tokens devueltos por LiteLLM / Groq
      if (data.usage) {
        totalInputTokens += Number(data.usage.input_tokens || 0)
        totalOutputTokens += Number(data.usage.output_tokens || 0)
      }

      const content = (data.content ?? []) as Array<Record<string, any>>

      // 1. Detectar invocaciones de herramientas (tool_use)
      const toolCalls = content.filter((item) => item.type === 'tool_use')
      if (toolCalls.length > 0) {
        messages.push({ role: 'assistant', content })

        const toolResults: Array<Record<string, any>> = []
        for (const toolCall of toolCalls) {
          toolsInvoked.push(toolCall.name)
          const toolArgs = {
            ...(toolCall.input ?? {}),
            ...(mediaId ? { mediaId } : {}),
          }
          const resultText = await executeShirleyTool(
            toolCall.name,
            toolArgs,
            payload,
          )
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: resultText,
          })
        }

        messages.push({ role: 'user', content: toolResults })
        continue
      }

      // 2. Extraer texto de respuesta final
      const textBlock = content.find((item) => item.type === 'text')
      if (textBlock && typeof textBlock.text === 'string' && textBlock.text.trim()) {
        const finalReply = textBlock.text.trim()

        // Persistir respuesta del asistente
        void persistMessage(payload, {
          chatId,
          role: 'assistant',
          content: finalReply,
          toolName: toolsInvoked.join(', ') || undefined,
        })

        // Registrar métrica de observabilidad con conteo de tokens
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
      }
    }

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
      errorMessage: 'Se alcanzó el límite de MAX_TURNS sin respuesta textual',
      model,
    })

    return AGENT_FALLBACK
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    payload.logger.error({
      msg: '[shirley-agent] Error crítico en el loop agéntico',
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
