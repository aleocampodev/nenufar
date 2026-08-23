/**
 * Runtime del bot de Shirley sobre Claude Agent SDK (IP-001 / ADR-002).
 *
 * El SDK corre el loop agéntico completo (decidir → llamar tool → procesar
 * resultado → responder). La inferencia NUNCA va a Anthropic paga: el SDK
 * apunta a ANTHROPIC_BASE_URL (= LiteLLM :4000), que traduce a Groq free.
 * Política #253 ($0/mes) intacta.
 */
import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Payload } from 'payload'
import { createShirleyTools } from './tools'

export interface RunShirleyAgentArgs {
  /** Mensaje de texto de Shirley. */
  text: string
  /** Instancia de Payload Local API para las tools. */
  payload: Payload
  /** chat_id de Telegram (contexto; ya validado como admin en el webhook). */
  chatId: number
  userName?: string
}

/** Mensaje de cortesía ante caída del gateway/timeout — jamás un stack trace a Telegram. */
export const AGENT_FALLBACK =
  'Shirley, tuve un inconveniente conectando con el servicio. Puedes revisar directamente en /admin mientras tanto 💜'

/** Límite de rondas agénticas (equivalente al MAX_TOOL_ROUNDS = 4 del runtime viejo). */
const MAX_TURNS = 4

/** Timeout total de la consulta (el webhook tiene maxDuration = 60). */
const TIMEOUT_MS = 45_000

const TOOL_NAMES = [
  'buscarProducto',
  'destacarProducto',
  'actualizarInventario',
  'pedidosPendientes',
  'confirmarPedido',
  'publicarEvento',
  'crearProductoDraft',
] as const

const MCP_SERVER_NAME = 'nenufar-tienda'

function buildSystemPrompt(userName?: string): string {
  const quien = userName ? ` (te escribe ${userName})` : ''
  return [
    'Eres el asistente de gestión de Nénufar, la marca de joyería artesanal de Shirley en Cartagena, Colombia.',
    `Tu única usuaria es Shirley, la dueña, escribiéndote desde Telegram${quien}.`,
    '',
    'Tono: cálido, cercano y cartagenero, pero eficiente. Respuestas cortas (es Telegram). Español.',
    '',
    'Reglas de negocio:',
    '- Precios siempre en pesos colombianos (COP) sin decimales.',
    '- Nunca inventes datos: si necesitas información del catálogo o pedidos, usa las herramientas.',
    '- Los productos nuevos y eventos se crean como borrador; Shirley los publica desde /admin.',
    '- Si una herramienta falla, discúlpate brevemente y sugiere revisar /admin. No muestres errores técnicos.',
    '- Si el mensaje es una pregunta general o saludo, responde directo sin usar herramientas.',
    '',
    `Herramientas disponibles: ${TOOL_NAMES.join(', ')}.`,
  ].join('\n')
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
}: RunShirleyAgentArgs): Promise<string> {
  void chatId // contexto reservado (logs/auditoría futura); el guard vive en el webhook.
  const abortController = new AbortController()
  const timer = setTimeout(() => abortController.abort(), TIMEOUT_MS)

  try {
    const mcpServers = { [MCP_SERVER_NAME]: createShirleyTools(payload) }

    const conversation = query({
      prompt: text,
      options: {
        model: process.env.ANTHROPIC_MODEL || 'nenufar-bot',
        systemPrompt: buildSystemPrompt(userName),
        maxTurns: MAX_TURNS,
        mcpServers,
        // Whitelist explícita: solo nuestras tools; los built-ins del CLI quedan fuera.
        allowedTools: TOOL_NAMES.map((name) => `mcp__${MCP_SERVER_NAME}__${name}`),
        abortController,
      },
    })

    for await (const message of conversation) {
      if (message.type !== 'result') continue
      if (message.subtype === 'success' && !message.is_error && message.result.trim()) {
        return message.result.trim()
      }
      payload.logger.warn({
        msg: '[shirley-agent] consulta terminó sin resultado útil',
        subtype: message.subtype,
        errors: 'errors' in message ? message.errors : undefined,
      })
      return AGENT_FALLBACK
    }

    return AGENT_FALLBACK
  } catch (err) {
    payload.logger.error({
      msg: '[shirley-agent] error crítico del runtime',
      err: err instanceof Error ? err.message : String(err),
    })
    return AGENT_FALLBACK
  } finally {
    clearTimeout(timer)
  }
}
