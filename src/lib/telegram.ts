/**
 * Telegram Bot API client — server-only.
 *
 * Nenúfar v3.1: this module is the ONLY place that knows about Telegram.
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
 * Sanitiza y adapta texto enriquecido para Telegram en modo HTML.
 * - Convierte markdown asteriscos (**negrita** / *cursiva*) a tags HTML <b> y <i>.
 * - Convierte encabezados Markdown (# Titulo) a negritas limpias.
 * - Escapa caracteres reservados (<, >, &) que NO pertenezcan a tags válidos de Telegram.
 * - Elimina asteriscos residuales sueltos para que la pantalla de Shirley quede 100% limpia.
 */
export function formatTelegramHtml(text: string): string {
  if (!text) return ''

  let processed = text

  // 1. Convertir encabezados Markdown: '### Titulo' -> '<b>Titulo</b>'
  processed = processed.replace(/^#{1,6}\s+(.+)$/gm, '<b>$1</b>')

  // 2. Extraer y proteger etiquetas HTML válidas de Telegram
  const validTags = 'b|strong|i|em|u|ins|s|strike|del|tg-spoiler|tg-emoji|code|pre|blockquote|a'
  const tagRegex = new RegExp(`(<(?:\\/(?:${validTags})|(?:${validTags})(?:\\s+[^>]*)?)>)`, 'gi')
  const tagPlaceholders: string[] = []

  processed = processed.replace(tagRegex, (match) => {
    const placeholder = `___TG_TAG_${tagPlaceholders.length}___`
    tagPlaceholders.push(match)
    return placeholder
  })

  // 3. Escapar caracteres HTML reservados (<, >, &) fuera de tags válidos
  processed = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 4. Convertir Markdown común a tags HTML de Telegram
  // **negrita** -> <b>negrita</b>
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  // *cursiva* -> <i>cursiva</i> (solo si no es parte de asterisco suelto)
  processed = processed.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<i>$2</i>$3')
  // `código` -> <code>código</code>
  processed = processed.replace(/`([^`\n]+)`/g, '<code>$1</code>')

  // 5. Eliminar cualquier asterisco residual que haya quedado suelto (** o *)
  processed = processed.replace(/\*{2,}/g, '').replace(/\*/g, '')

  // 6. Restaurar las etiquetas HTML originales
  for (let i = 0; i < tagPlaceholders.length; i++) {
    processed = processed.replace(`___TG_TAG_${i}___`, tagPlaceholders[i])
  }

  return processed
}

/**
 * Splits a long message on newline boundaries so every part fits within
 * Telegram's hard cap. Oversized single lines are hard-cut as a last resort
 * (may split an HTML tag — callers with markup should keep lines short).
 */
export function splitTelegramMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]
  const parts: string[] = []
  let current = ''
  for (const line of text.split('\n')) {
    if (line.length > maxLength) {
      if (current) {
        parts.push(current)
        current = ''
      }
      for (let i = 0; i < line.length; i += maxLength) {
        parts.push(line.slice(i, i + maxLength))
      }
      continue
    }
    const candidate = current ? `${current}\n${line}` : line
    if (candidate.length > maxLength) {
      parts.push(current)
      current = line
    } else {
      current = candidate
    }
  }
  if (current) parts.push(current)
  return parts.length > 0 ? parts : [text]
}

async function postTelegramText(
  token: string,
  chatId: number | string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' | undefined,
  disableWebPagePreview: boolean,
): Promise<SendTelegramMessageResult> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        disable_web_page_preview: disableWebPagePreview,
      }),
      // Don't let Telegram hang us indefinitely
      signal: AbortSignal.timeout(10_000),
    })

    const data: TelegramApiResponse = await response.json()

    if (!response.ok || !data.ok) {
      // Si falló por formato (ej. entidades no reconocidas), reintentar como texto plano para garantizar entrega
      if (parseMode && data.description?.includes("can't parse entities")) {
        const plainText = text
          .replace(/<[^>]*>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
        const retryRes = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: plainText,
            disable_web_page_preview: disableWebPagePreview,
          }),
          signal: AbortSignal.timeout(10_000),
        })
        const retryData = (await retryRes.json()) as TelegramApiResponse
        if (retryData.ok) {
          return { ok: true, messageId: retryData.result?.message_id }
        }
      }

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

/**
 * Sends one message to the configured Telegram channel.
 * Long texts are split into sequential parts within the size cap.
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

  const formattedText = parseMode === 'HTML' ? formatTelegramHtml(text) : text
  const parts = splitTelegramMessage(formattedText, TELEGRAM_MESSAGE_MAX_LENGTH)
  let lastMessageId: number | undefined
  for (let i = 0; i < parts.length; i++) {
    const part = parts.length > 1 ? `${parts[i]}\n…(${i + 1}/${parts.length})` : parts[i]
    const result = await postTelegramText(token, channelId, part, parseMode, disableWebPagePreview)
    if (!result.ok) return result
    lastMessageId = result.messageId
  }
  return { ok: true, messageId: lastMessageId }
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
  /** Token del bot a usar. Por defecto usa el mismo TELEGRAM_BOT_TOKEN del sistema. */
  botToken?: string
}

/**
 * Responde a un chat concreto (la clienta) — mismo bot, chat_id diferente al canal.
 *
 * sendTelegramMessage envía al TELEGRAM_CHANNEL_ID de Shirley.
 * sendTelegramReply envía al chat_id de quien escribió al bot. Nunca lanza.
 */
export async function sendTelegramReply({
  chatId,
  text,
  parseMode = 'HTML',
  botToken,
}: SendTelegramReplyArgs): Promise<SendTelegramMessageResult> {
  const token = botToken ?? process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return { ok: false, error: 'No hay token de bot asistente configurado' }
  }

  const formattedText = parseMode === 'HTML' ? formatTelegramHtml(text) : text
  const parts = splitTelegramMessage(formattedText, TELEGRAM_MESSAGE_MAX_LENGTH)
  let lastMessageId: number | undefined
  for (let i = 0; i < parts.length; i++) {
    const part = parts.length > 1 ? `${parts[i]}\n…(${i + 1}/${parts.length})` : parts[i]
    const result = await postTelegramText(token, chatId, part, parseMode, true)
    if (!result.ok) return result
    lastMessageId = result.messageId
  }
  return { ok: true, messageId: lastMessageId }
}

/**
 * Envía una acción de chat (ej. "typing" / escribiendo...) para mejorar el feedback visual en Telegram.
 */
export async function sendTelegramChatAction(
  chatId: number | string,
  action: 'typing' | 'upload_photo' = 'typing'
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action,
      }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    // Non-fatal: la falla de la acción no debe detener el flujo.
  }
}
