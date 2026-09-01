/**
 * Módulo de transcripción de notas de voz / audio para el Bot de Shirley.
 *
 * Usa Whisper en Groq (free tier, $0/mes — política canónica #253).
 * Modelo: whisper-large-v3-turbo / whisper-large-v3 con contexto en español
 * especializado en joyería artesanal cartagenera.
 */

export interface TranscribeAudioArgs {
  /** Buffer del archivo de audio (ej. .ogg / .oga de Telegram). */
  audioBuffer: Buffer | ArrayBuffer
  /** Nombre del archivo simulado con extensión (ej. "voice.ogg"). */
  filename?: string
  /** Tipo MIME (ej. "audio/ogg"). */
  mimetype?: string
  /** Prompt contextual para guiar el vocabulario de Whisper. */
  prompt?: string
}

const DEFAULT_PROMPT =
  'Shirley, Nénufar, joyería artesanal, Cartagena, filigrana, mostacilla, aretes, collares, pulseras, anillos, tobilleras, inventario, precios en pesos colombianos COP, pedidos, taller Getsemaní.'

/**
 * Transcribe un archivo de audio a texto en español usando la API de Groq Whisper.
 */
export async function transcribeAudioWithGroq({
  audioBuffer,
  filename = 'voice.ogg',
  mimetype = 'audio/ogg',
  prompt = DEFAULT_PROMPT,
}: TranscribeAudioArgs): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY no está configurada para transcripción de audio.')
  }

  const formData = new FormData()
  const blob = new Blob([audioBuffer], { type: mimetype })
  formData.append('file', blob, filename)
  formData.append('model', 'whisper-large-v3-turbo')
  formData.append('language', 'es')
  formData.append('response_format', 'json')
  formData.append('temperature', '0')
  if (prompt) {
    formData.append('prompt', prompt)
  }

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Error en Groq Whisper API (HTTP ${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { text?: string }
  const text = data.text ? data.text.trim() : ''

  return text
}
