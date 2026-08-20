/**
 * Tipos base del sistema multiagente del bot de Telegram.
 *
 * - Skill  = una herramienta (función) que el LLM puede invocar vía tool-calling.
 * - Agent  = un LLM (Groq) con un rol/prompt + un set de skills.
 * - El orquestador (orchestrator.ts) decide a qué agente enrutar cada mensaje.
 */
import type { Payload } from 'payload'

export interface AgentContext {
  payload: Payload
  /** chat_id de Telegram de la persona (para responderle y para el handoff). */
  chatId: number
  /** Nombre visible de la persona, si Telegram lo entrega. */
  userName?: string
}

/** Definición de herramienta en formato OpenAI/Groq (tool-calling). */
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface Skill {
  name: string
  definition: ToolDefinition
  /** Ejecuta la skill; el string devuelto vuelve al LLM como observación. */
  run: (args: Record<string, unknown>, ctx: AgentContext) => Promise<string>
}

export interface Agent {
  name: string
  systemPrompt: string
  skills: Skill[]
}
