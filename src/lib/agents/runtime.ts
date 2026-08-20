/**
 * Runtime de un agente: corre el loop de tool-calling con Groq.
 *
 * Ciclo: llamada a Groq → si pide skills, se ejecutan y se reenvían sus
 * resultados → se repite hasta que el agente responde en texto (o se agota
 * el máximo de rondas).
 */
import type Groq from 'groq-sdk'
import { getGroq, GROQ_MODEL } from '@/lib/groq'
import type { Agent, AgentContext, Skill } from './types'

const MAX_TOOL_ROUNDS = 4
const FALLBACK = 'Lo siento, no pude generar una respuesta en este momento.'

export async function runAgent(
  agent: Agent,
  userMessage: string,
  ctx: AgentContext,
): Promise<string> {
  const groq = getGroq()
  const skillsByName = new Map<string, Skill>(agent.skills.map((s) => [s.name, s]))

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: agent.systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const tools = agent.skills.length
    ? (agent.skills.map((s) => s.definition) as Groq.Chat.Completions.ChatCompletionTool[])
    : undefined

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools,
      tool_choice: tools ? 'auto' : undefined,
      temperature: 0.4,
    })

    const choice = completion.choices[0]?.message
    if (!choice) return FALLBACK

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return choice.content ?? FALLBACK
    }

    // El agente pidió herramientas: registramos su turno y ejecutamos cada una.
    messages.push(choice as Groq.Chat.Completions.ChatCompletionMessageParam)

    for (const call of choice.tool_calls) {
      let result: string
      const skill = skillsByName.get(call.function.name)
      if (!skill) {
        result = `Error: skill desconocida "${call.function.name}".`
      } else {
        try {
          const args = call.function.arguments
            ? (JSON.parse(call.function.arguments) as Record<string, unknown>)
            : {}
          result = await skill.run(args, ctx)
        } catch (err) {
          result = `Error ejecutando ${call.function.name}: ${
            err instanceof Error ? err.message : 'desconocido'
          }`
        }
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: result })
    }
  }

  // Se agotaron las rondas de herramientas — pedimos una respuesta final en texto.
  const finalCompletion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: 0.4,
  })
  return finalCompletion.choices[0]?.message?.content ?? FALLBACK
}
