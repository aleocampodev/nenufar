/**
 * Webhook del bot de gestión de Shirley.
 *
 * Telegram hace POST aquí en cada mensaje. Validamos el secreto, deduplicamos
 * por update_id, verificamos que SOLO Shirley (TELEGRAM_ADMIN_CHAT_ID) pueda
 * usarlo y corremos el agente (Claude Agent SDK → LiteLLM → Groq free).
 * Fuera de /api para no chocar con el catch-all de Payload.
 *
 * Registrar el webhook: pnpm tsx scripts/set-telegram-webhook.ts <url-publica>
 */
import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { runShirleyAgent } from '@/lib/agent/runShirleyAgent'
import { sendTelegramChatAction, sendTelegramReply } from '@/lib/telegram'

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

interface TelegramPhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

interface TelegramUpdate {
  update_id: number
  message?: {
    chat: { id: number }
    from?: { first_name?: string; username?: string }
    text?: string
    caption?: string
    photo?: TelegramPhotoSize[]
  }
}

/** chat_id personal de Shirley — ÚNICO remitente que el bot procesa. */
function isAuthorizedAdmin(chatId: number): boolean {
  const adminChatId = Number(process.env.TELEGRAM_ADMIN_CHAT_ID)
  if (!Number.isFinite(adminChatId)) return false
  return chatId === adminChatId
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
  const text = (message?.text ?? message?.caption ?? '')?.trim()
  const chatId = message?.chat?.id

  // Updates sin texto ni caption (stickers, joins…) se aceptan sin procesar.
  if (!text || chatId === undefined) {
    return Response.json({ ok: true })
  }

  // 2. Guard single-admin: el bot es EXCLUSIVO de Shirley. Cualquier otro
  //    remitente se rechaza en silencio con 200 OK para evitar reintentos
  //    infinitos de Telegram.
  if (!isAuthorizedAdmin(chatId)) {
    return Response.json({ ok: true, ignored: 'unauthorized' })
  }

  // 3. Dedupe por update_id — un mensaje repetido NUNCA ejecuta tools dos veces.
  if (alreadySeen(update.update_id)) {
    return Response.json({ ok: true })
  }

  const payload = await getPayload({ config })

  // Feedback visual: mostrar "escribiendo..." en Telegram
  void sendTelegramChatAction(chatId, 'typing')
  const typingInterval = setInterval(() => {
    void sendTelegramChatAction(chatId, 'typing')
  }, 4000)

  try {
    let uploadedMediaId: number | undefined

    // Procesar foto adjunta de Telegram si existe
    if (message?.photo && message.photo.length > 0 && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const bestPhoto = message.photo[message.photo.length - 1]
        const fileRes = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${bestPhoto.file_id}`,
        )
        const fileJson = (await fileRes.json()) as {
          ok: boolean
          result?: { file_path?: string }
        }
        if (fileJson.ok && fileJson.result?.file_path) {
          const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileJson.result.file_path}`
          const imgRes = await fetch(downloadUrl)
          const arrayBuffer = await imgRes.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const mediaDoc = await payload.create({
            collection: 'media',
            data: {
              alt: text || 'Joya Nénufar',
            },
            file: {
              data: buffer,
              mimetype: 'image/jpeg',
              name: `joya-${Date.now()}.jpg`,
              size: buffer.length,
            },
            overrideAccess: true,
          })
          uploadedMediaId = mediaDoc.id
          payload.logger.info({
            msg: '[telegram] Foto descargada y guardada en Media',
            mediaId: uploadedMediaId,
          })
        }
      } catch (mediaErr) {
        payload.logger.error({ msg: '[telegram] Error descargando foto de Telegram', err: mediaErr })
      }
    }

    const reply = await runShirleyAgent({
      text,
      payload,
      chatId,
      mediaId: uploadedMediaId,
    })
    payload.logger.info({ msg: '[telegram] handled by shirley-agent', chatId })
    await sendTelegramReply({ chatId, text: reply })
  } catch (err) {
    payload.logger.error({ msg: '[telegram] error', err })
    await sendTelegramReply({
      chatId,
      text: 'Uy, tuve un problemita para responder. ¿Puedes intentar de nuevo en un momento? 💜',
    })
  } finally {
    clearInterval(typingInterval)
  }

  return Response.json({ ok: true })
}
