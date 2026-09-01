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
import { transcribeAudioWithGroq } from '@/lib/agent/transcribe'
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

interface TelegramVoice {
  file_id: string
  file_unique_id: string
  duration: number
  mime_type?: string
  file_size?: number
}

interface TelegramAudio {
  file_id: string
  file_unique_id: string
  duration: number
  mime_type?: string
  file_size?: number
  title?: string
}

interface TelegramUpdate {
  update_id: number
  message?: {
    chat: { id: number }
    from?: { first_name?: string; username?: string }
    text?: string
    caption?: string
    photo?: TelegramPhotoSize[]
    voice?: TelegramVoice
    audio?: TelegramAudio
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
  let text = (message?.text ?? message?.caption ?? '')?.trim()
  const chatId = message?.chat?.id

  // 2. Guard single-admin: el bot es EXCLUSIVO de Shirley. Cualquier otro
  //    remitente se rechaza en silencio con 200 OK para evitar reintentos
  //    infinitos de Telegram.
  if (chatId === undefined || !isAuthorizedAdmin(chatId)) {
    return Response.json({ ok: true, ignored: 'unauthorized' })
  }

  // Updates sin texto, ni foto, ni audio/voz se aceptan sin procesar.
  if (!text && !message?.photo && !message?.voice && !message?.audio) {
    return Response.json({ ok: true })
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

    // 4. Procesar nota de voz o audio con Groq Whisper si existe
    const audioObj = message?.voice ?? message?.audio
    if (audioObj?.file_id && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const fileRes = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${audioObj.file_id}`,
        )
        const fileJson = (await fileRes.json()) as {
          ok: boolean
          result?: { file_path?: string }
        }

        if (fileJson.ok && fileJson.result?.file_path) {
          const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileJson.result.file_path}`
          const audioRes = await fetch(downloadUrl)
          const arrayBuffer = await audioRes.arrayBuffer()
          const audioBuffer = Buffer.from(arrayBuffer)
          const ext = fileJson.result.file_path.split('.').pop() || 'ogg'

          const transcribed = await transcribeAudioWithGroq({
            audioBuffer,
            filename: `voice-${Date.now()}.${ext}`,
            mimetype: audioObj.mime_type || 'audio/ogg',
          })

          if (transcribed) {
            payload.logger.info({
              msg: '[telegram] Nota de voz transcrita con Groq Whisper',
              transcribed,
            })
            text = text ? `${text}\n${transcribed}` : transcribed
          }
        }
      } catch (audioErr) {
        payload.logger.error({
          msg: '[telegram] Error transcribiendo nota de voz con Groq Whisper',
          err: audioErr,
        })
      }
    }

    // Si después de intentar transcribir aún no hay texto
    if (!text && !message?.photo) {
      clearInterval(typingInterval)
      await sendTelegramReply({
        chatId,
        text: 'Shirley, no alcancé a escuchar con claridad tu nota de voz 🎙️. ¿Me la repites o me escribes por texto? 💜',
      })
      return Response.json({ ok: true })
    }

    // 5. Procesar foto adjunta de Telegram si existe
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
      text: text || 'Shirley envió una foto para el catálogo o landing.',
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
