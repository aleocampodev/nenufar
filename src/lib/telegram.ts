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
