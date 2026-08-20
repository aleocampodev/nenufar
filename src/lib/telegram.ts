/**
 * Telegram Bot API client — server-only.
 *
 * Nénufar v3.1: this module is the ONLY place that knows about Telegram.
 * The buyer never sees Telegram — the server-side order action calls this
 * module after validating consent + idempotency. Constitution §2.4.
 *
 * Bot setup (one-time, manual): see README → "Telegram setup".
 */

export interface SendTelegramMessageArgs {
  text: string
  parseMode?: 'HTML' | 'MarkdownV2'
  disableWebPagePreview?: boolean
}

export interface SendTelegramMessageResult {
  ok: boolean
  messageId?: number
  error?: string
}

const TELEGRAM_API_BASE = 'https://api.telegram.org'

/**
 * Sends one message to the configured Telegram channel.
 * Returns ok=false (never throws) so callers can render a retry screen.
 */
export async function sendTelegramMessage({
  text,
  parseMode = 'HTML',
  disableWebPagePreview = true,
}: SendTelegramMessageArgs): Promise<SendTelegramMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID

  if (!token) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN is not configured' }
  }
  if (!channelId) {
    return { ok: false, error: 'TELEGRAM_CHANNEL_ID is not configured' }
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview,
      }),
      // Don't let Telegram hang us indefinitely
      signal: AbortSignal.timeout(10_000),
    })

    const data: TelegramApiResponse = await response.json()

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error: data.description || `Telegram API returned HTTP ${response.status}`,
      }
    }

    return { ok: true, messageId: data.result?.message_id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

interface TelegramApiResponse {
  ok: boolean
  description?: string
  result?: {
    message_id: number
  }
}

/**
 * Telegram message size cap — long carts must be split (constitution §6 known gap).
 * We use 4000 (below the 4096 hard cap) to leave room for HTML wrapping.
 */
export const TELEGRAM_MESSAGE_MAX_LENGTH = 4000

export interface SendTelegramPhotoArgs {
  /** Absolute path to a local file — used in dev (localhost not reachable by Telegram). */
  filePath?: string
  /** Full public URL — used in production (Cloudinary / Vercel Blob). */
  photoUrl?: string
  caption?: string
}

/**
 * Sends one photo to the configured Telegram chat.
 * Tries local file upload first (dev), falls back to public URL (production).
 * Returns ok=false (never throws) — photo failures are non-fatal for the order flow.
 */
export async function sendTelegramPhoto({
  filePath,
  photoUrl,
  caption,
}: SendTelegramPhotoArgs): Promise<SendTelegramMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID

  if (!token || !channelId) {
    return { ok: false, error: 'Telegram not configured' }
  }

  // 1. Local file upload (works in dev — Telegram can't reach localhost)
  if (filePath) {
    try {
      const fs = await import('fs')
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath)
        const form = new FormData()
        form.append('chat_id', channelId)
        form.append('photo', new Blob([fileBuffer]), filePath.split('/').pop() ?? 'photo.jpg')
        if (caption) form.append('caption', caption)

        const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendPhoto`, {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(30_000),
        })
        const data: TelegramApiResponse = await response.json()
        if (data.ok) return { ok: true, messageId: data.result?.message_id }
      }
    } catch {
      // fall through to URL approach
    }
  }

  // 2. Public URL (works in production with Vercel Blob / Cloudinary)
  if (photoUrl) {
    const fullUrl = photoUrl.startsWith('http')
      ? photoUrl
      : `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}${photoUrl}`

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          photo: fullUrl,
          caption: caption ?? undefined,
        }),
        signal: AbortSignal.timeout(30_000),
      })
      const data: TelegramApiResponse = await response.json()
      if (!response.ok || !data.ok) {
        return { ok: false, error: data.description || `HTTP ${response.status}` }
      }
      return { ok: true, messageId: data.result?.message_id }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { ok: false, error: message }
    }
  }

  return { ok: false, error: 'No filePath or photoUrl provided' }
}

export interface SendTelegramReplyArgs {
  /** chat_id de la persona que escribió al bot. */
  chatId: number | string
  text: string
  parseMode?: 'HTML' | 'MarkdownV2'
  /** Token del bot a usar. Por defecto el bot asistente (conversacional). */
  botToken?: string
}

/**
 * Responde a un chat concreto (la clienta) — usado por el bot ASISTENTE.
 *
 * A diferencia de sendTelegramMessage (que apunta al canal de pedidos), esto
 * envía a un chat_id arbitrario con el bot conversacional. Nunca lanza.
 */
export async function sendTelegramReply({
  chatId,
  text,
  parseMode = 'HTML',
  botToken,
}: SendTelegramReplyArgs): Promise<SendTelegramMessageResult> {
  const token =
    botToken ?? process.env.TELEGRAM_ASSISTANT_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return { ok: false, error: 'No hay token de bot asistente configurado' }
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    const data: TelegramApiResponse = await response.json()
    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error: data.description || `Telegram API returned HTTP ${response.status}`,
      }
    }
    return { ok: true, messageId: data.result?.message_id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}
