/**
 * Voice-note transcription for Shirley's Telegram audio (server-only).
 *
 * Audio flow: Telegram file bytes → LiteLLM :4000
 * (/v1/audio/transcriptions, OpenAI-compatible) → Groq Whisper free tier.
 * Never throws: returns null when anything is missing or fails, so the
 * caller can fall back to the fixed "send text instead" reply.
 */

const TRANSCRIBE_TIMEOUT_MS = 60_000
const MAX_AUDIO_BYTES = 10 * 1024 * 1024 // 10 MB — Telegram voice notes are tiny

export async function transcribeTelegramVoice(fileId: string): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || !fileId) return null

  const baseUrl = (process.env.ANTHROPIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')
  const apiKey =
    process.env.ANTHROPIC_AUTH_TOKEN || process.env.LITELLM_MASTER_KEY || 'sk-nenufar-local'

  try {
    const fileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
      { signal: AbortSignal.timeout(15_000) },
    )
    const fileJson = (await fileRes.json()) as { ok: boolean; result?: { file_path?: string } }
    if (!fileJson.ok || !fileJson.result?.file_path) return null

    const audioRes = await fetch(
      `https://api.telegram.org/file/bot${botToken}/${fileJson.result.file_path}`,
      { signal: AbortSignal.timeout(30_000) },
    )
    const buffer = Buffer.from(await audioRes.arrayBuffer())
    if (buffer.length === 0 || buffer.length > MAX_AUDIO_BYTES) return null

    const fileName = fileJson.result.file_path.split('/').pop() || 'voice.ogg'
    const form = new FormData()
    form.append('file', new Blob([buffer]), fileName)
    form.append('model', 'nenufar-whisper')
    form.append('language', 'es')

    const sttRes = await fetch(`${baseUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
    })
    if (!sttRes.ok) return null
    const sttJson = (await sttRes.json()) as { text?: string }
    const transcript = typeof sttJson.text === 'string' ? sttJson.text.trim() : ''
    return transcript || null
  } catch {
    return null
  }
}
