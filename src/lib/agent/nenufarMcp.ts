import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk'
import {
  SHIRLEY_TOOL_DEFINITIONS,
  destructiveToolNames,
  type ToolContext,
} from './toolRegistry'
import {
  createConfirmationService,
  type PendingConfirmation,
} from './confirmation'

export type { ToolContext }
export type { PendingConfirmation }
export { CONFIRM_RE, CANCEL_RE } from './confirmation'

let activeContext: ToolContext | null = null

export function setMcpPayload(payload: ToolContext['payload']): void {
  activeContext = { payload, chatId: activeContext?.chatId ?? 0, mediaId: activeContext?.mediaId }
}

export function setMcpContext(context: ToolContext): void {
  activeContext = context
}

function requireContext(): ToolContext {
  if (!activeContext) throw new Error('MCP context not set')
  return activeContext
}

/** Destructive names — derived from the registry, never hardcoded twice. */
export const MCP_DESTRUCTIVE_TOOLS: Set<string> = destructiveToolNames()

export const PENDING_TTL_MS = 5 * 60_000

/** Shared HITL service — the same instance the runner's pre-query block resolves. */
export const confirmationService = createConfirmationService()

export function setPendingConfirmation(chatId: number, pending: PendingConfirmation): void {
  confirmationService.store(chatId, pending)
}

export function peekPendingConfirmation(chatId: number): PendingConfirmation | undefined {
  return confirmationService.peek(chatId)
}

export function takePendingConfirmation(chatId: number): PendingConfirmation | undefined {
  return confirmationService.take(chatId)
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

/**
 * HITL gate for destructive tools. Stores the pending action and returns a
 * confirmation prompt for the model to relay. The "sí" arrives as the next
 * Telegram message and is executed by the pre-query block in runShirleyAgent.
 */
function gateDestructive(toolName: string, args: Record<string, any>): string {
  const { chatId } = requireContext()
  return confirmationService.request(chatId, toolName, args)
}

const sdkTools = SHIRLEY_TOOL_DEFINITIONS.map((def) =>
  tool(def.name, def.description, def.inputSchema, async (args) => {
    const ctx = requireContext()
    if (MCP_DESTRUCTIVE_TOOLS.has(def.name)) {
      return textResult(gateDestructive(def.name, { ...(args as any) }))
    }
    return textResult(await def.run(args as any, ctx))
  }),
)

export const nenufarMcpServer = createSdkMcpServer({
  name: 'nenufar-tienda',
  tools: sdkTools,
})
