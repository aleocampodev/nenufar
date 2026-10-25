import { z } from 'zod'
import type { Payload } from 'payload'
import { SHIRLEY_TOOL_DEFINITIONS } from './toolRegistry'
import { executeShirleyTool } from './tools'

export interface DirectGatewayAgentArgs {
  prompt: string
  systemPrompt: string
  baseUrl: string
  apiKey: string
  model: string
  payload: Payload
  mediaId?: number
  maxTurns?: number
  timeoutMs?: number
  toolsInvoked?: string[]
}

export interface DirectGatewayAgentResult {
  reply: string
  toolsInvoked: string[]
  inputTokens: number
  outputTokens: number
}

/**
 * Serverless-compatible agent loop that queries LiteLLM / Groq directly
 * via standard OpenAI-compatible tool calling over HTTP.
 *
 * Avoids spawning local CLI binaries which fail in AWS Lambda / Vercel serverless environments.
 */
export async function runDirectGatewayAgent({
  prompt,
  systemPrompt,
  baseUrl,
  apiKey,
  model,
  payload,
  mediaId,
  maxTurns = 4,
  timeoutMs = 45000,
  toolsInvoked = [],
}: DirectGatewayAgentArgs): Promise<DirectGatewayAgentResult> {
  const tools = SHIRLEY_TOOL_DEFINITIONS.map((def) => {
    let parameters: Record<string, any>
    try {
      parameters = z.toJSONSchema(z.object(def.inputSchema)) as Record<string, any>
      delete parameters['$schema']
    } catch {
      parameters = { type: 'object', properties: {} }
    }
    return {
      type: 'function',
      function: {
        name: def.name,
        description: def.description,
        parameters,
      },
    }
  })

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ]

  let totalInputTokens = 0
  let totalOutputTokens = 0
  let finalReply = ''

  for (let turn = 0; turn < maxTurns; turn++) {
    const cleanUrl = baseUrl.replace(/\/$/, '')
    const res = await fetch(`${cleanUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Gateway HTTP ${res.status}: ${errText}`)
    }

    const data: any = await res.json()
    const usage = data?.usage
    totalInputTokens += Number(usage?.prompt_tokens ?? 0)
    totalOutputTokens += Number(usage?.completion_tokens ?? 0)

    const choice = data?.choices?.[0]
    const assistantMessage = choice?.message
    if (!assistantMessage) break

    messages.push(assistantMessage)

    if (
      assistantMessage.tool_calls &&
      Array.isArray(assistantMessage.tool_calls) &&
      assistantMessage.tool_calls.length > 0
    ) {
      for (const call of assistantMessage.tool_calls) {
        const toolName = call.function?.name
        if (!toolName) continue
        if (!toolsInvoked.includes(toolName)) toolsInvoked.push(toolName)

        let parsedArgs: Record<string, any> = {}
        try {
          parsedArgs = JSON.parse(call.function?.arguments || '{}')
        } catch {
          parsedArgs = {}
        }
        if (mediaId) parsedArgs.mediaId = mediaId

        let toolResultText = ''
        try {
          toolResultText = await executeShirleyTool(toolName, parsedArgs, payload)
        } catch (toolErr) {
          toolResultText = `Error al ejecutar ${toolName}: ${toolErr instanceof Error ? toolErr.message : String(toolErr)}`
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: toolResultText,
        })
      }
    } else {
      finalReply = (assistantMessage.content ?? '').trim()
      break
    }
  }

  return {
    reply: finalReply,
    toolsInvoked,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  }
}
