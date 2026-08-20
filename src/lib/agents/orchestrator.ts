/**
 * Orquestador — decide a qué agente enrutar el mensaje y lo ejecuta.
 *
 * Patrón "router → agente → skill". Por ahora 2 agentes; se agregan más
 * registrándolos en AGENTS y describiéndolos en el prompt del router.
 */
import { getGroq, GROQ_MODEL } from '@/lib/groq'
import { catalogoAgent } from './catalogo'
import { conversacionAgent } from './conversacion'
import { runAgent } from './runtime'
import type { AgentContext } from './types'

const AGENTS = {
  catalogo: catalogoAgent,
  conversacion: conversacionAgent,
} as const

export type AgentKey = keyof typeof AGENTS

const ROUTER_PROMPT = [
  'Eres un enrutador de un bot de joyería. Lee el mensaje de la clienta y decide qué agente lo atiende.',
  'Responde SOLO con una palabra, sin explicaciones ni signos:',
  '- catalogo: si pregunta por productos, piezas, precios, disponibilidad, o busca algo concreto.',
  '- conversacion: para todo lo demás (saludos, dudas generales, personalizar, comprar, coordinar).',
].join('\n')

async function route(message: string): Promise<AgentKey> {
  const groq = getGroq()
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: ROUTER_PROMPT },
      { role: 'user', content: message },
    ],
    temperature: 0,
    max_tokens: 4,
  })
  const raw = (completion.choices[0]?.message?.content ?? '').toLowerCase()
  if (raw.includes('catalogo') || raw.includes('catálogo')) return 'catalogo'
  return 'conversacion'
}

export interface RouteResult {
  agent: AgentKey
  reply: string
}

/** Enruta el mensaje al agente adecuado y devuelve su respuesta. */
export async function routeAndRun(message: string, ctx: AgentContext): Promise<RouteResult> {
  const agent = await route(message)
  const reply = await runAgent(AGENTS[agent], message, ctx)
  return { agent, reply }
}
