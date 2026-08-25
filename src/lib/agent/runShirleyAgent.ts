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

/** Timeout total de la consulta. */
const TIMEOUT_MS = 25_000

function buildSystemPrompt(userName?: string): string {
  const nombre = userName ? userName : 'Shirley'
  return [
    'Eres el asistente de gestión de Nénufar, la marca de joyería artesanal en Cartagena, Colombia.',
    `Tu interlocutora es ${nombre}, quien administra y opera la tienda, escribiéndote desde Telegram.`,
    `Dirígete siempre a ella amablemente por su nombre (${nombre}).`,
    '',
    'Tono: cálido, cercano y cartagenero, pero eficiente. Respuestas cortas (es Telegram). Español.',
    '',
    'Reglas de negocio:',
    '- Precios siempre en pesos colombianos (COP) sin decimales.',
    '- Nunca inventes datos: si necesitas información del catálogo o pedidos, usa las herramientas.',
    '- Si te preguntan qué productos hay, qué joyas vendemos o piden ver el catálogo, USA SIEMPRE la herramienta buscarProducto (con consulta vacía o palabra clave) para obtener la lista real de la base de datos.',
    '- Puedes crear productos en borrador o publicarlos de inmediato en la tienda web (/shop) si te lo pide.',
    '- Puedes publicar o despublicar cualquier producto existente con la herramienta publicarProducto.',
    '- Si una herramienta falla, discúlpate brevemente y sugiere revisar /admin. No muestres errores técnicos.',
    '- Si el mensaje es una pregunta general o saludo, responde directo sin usar herramientas.',
  ].join('\n')
}

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | Array<Record<string, any>>
}

/**
 * Corre una consulta agéntica completa y devuelve el texto final para enviar
 * por Telegram. Nunca lanza: ante cualquier fallo devuelve AGENT_FALLBACK.
 */
export async function runShirleyAgent({
  text,
  payload,
  chatId,
  userName,
  mediaId,
}: RunShirleyAgentArgs): Promise<string> {
  void chatId
  const cleanPrompt = (() => {
    const trimmed = text.trim()
    const nombre = userName ? userName : 'Shirley'
    if (trimmed === '/start' || trimmed === '/iniciar') {
      return `Hola, soy ${nombre}. ¿Cómo estás y en qué me puedes ayudar hoy en la tienda?`
    }
    if (trimmed === '/help' || trimmed === '/ayuda') {
      return '¿Qué herramientas y tareas puedes hacer por mí en la tienda?'
    }
    if (trimmed.startsWith('/')) {
      return trimmed.replace(/^\/+/, '')
    }
    return trimmed
  })()

  const system = buildSystemPrompt(userName)
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')
  const apiKey =
    process.env.ANTHROPIC_AUTH_TOKEN || process.env.LITELLM_MASTER_KEY || 'sk-nenufar-local'
  const model = process.env.ANTHROPIC_MODEL || 'nenufar-bot'

  const messages: AnthropicMessage[] = [{ role: 'user', content: cleanPrompt }]

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
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

      if (!response.ok) {
        const errorText = await response.text()
        payload.logger.error({
          msg: '[shirley-agent] Error en llamada a Anthropic/LiteLLM',
          status: response.status,
          errorText,
        })
        return AGENT_FALLBACK
      }

      const data = await response.json()
      const content = (data.content ?? []) as Array<Record<string, any>>

      // 1. Detectar invocaciones de herramientas (tool_use)
      const toolCalls = content.filter((item) => item.type === 'tool_use')
      if (toolCalls.length > 0) {
        messages.push({ role: 'assistant', content })

        const toolResults: Array<Record<string, any>> = []
        for (const toolCall of toolCalls) {
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
        return textBlock.text.trim()
      }
    }

    return AGENT_FALLBACK
  } catch (err) {
    payload.logger.error({
      msg: '[shirley-agent] Error crítico en el loop agéntico',
      err: err instanceof Error ? err.message : String(err),
    })
    return AGENT_FALLBACK
  }
}
