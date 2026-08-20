/**
 * Webhook del bot asistente de Telegram.
 *
 * Telegram hace POST aquí en cada mensaje. Validamos el secreto, deduplicamos
 * por update_id, enrutamos con el orquestador multiagente y respondemos a la
 * clienta. Fuera de /api para no chocar con el catch-all de Payload.
 *
 * Registrar el webhook: pnpm tsx scripts/set-telegram-webhook.ts <url-publica>
 */
import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { routeAndRun } from '@/lib/agents/orchestrator'
import { sendTelegramReply } from '@/lib/telegram'

export const maxDuration = 60

// Dedupe de updates (Telegram reintenta si no recibe 200). Suficiente para
// instancia única — mismo criterio que src/lib/idempotency.ts.
const seenUpdates = new Set<number>()
function alreadySeen(updateId: number): boolean {
  if (seenUpdates.has(updateId)) return true
  seenUpdates.add(updateId)
  if (seenUpdates.size > 1000) {
    const oldest = seenUpdates.values().next().value
    if (oldest !== undefined) seenUpdates.delete(oldest)
  }
  return false
}

interface TelegramUpdate {
  update_id: number
  message?: {
    chat: { id: number }
    from?: { first_name?: string; username?: string }
    text?: string
  }
}

export async function POST(request: Request): Promise<Response> {
  // 1. Autenticación: Telegram reenvía nuestro secreto en este header.
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (expectedSecret) {
    const got = (await headers()).get('x-telegram-bot-api-secret-token')
    if (got !== expectedSecret) {
      return new Response('forbidden', { status: 403 })
    }
  }

  let update: TelegramUpdate
  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    return new Response('bad request', { status: 400 })
  }

  const message = update.message
  const text = message?.text?.trim()
  const chatId = message?.chat?.id

  // Updates sin texto (fotos, stickers, joins…) se aceptan sin procesar.
  if (!text || chatId === undefined) {
    return Response.json({ ok: true })
  }
  if (alreadySeen(update.update_id)) {
    return Response.json({ ok: true })
  }

  const payload = await getPayload({ config })

  try {
    const userName = message?.from?.first_name ?? message?.from?.username
    const { agent, reply } = await routeAndRun(text, { payload, chatId, userName })
    payload.logger.info({ msg: '[telegram] handled', chatId, agent })
    await sendTelegramReply({ chatId, text: reply })
  } catch (err) {
    payload.logger.error({ msg: '[telegram] error', err })
    await sendTelegramReply({
      chatId,
      text: 'Uy, tuve un problemita para responder. ¿Puedes intentar de nuevo en un momento? 💜',
    })
  }

  return Response.json({ ok: true })
}
