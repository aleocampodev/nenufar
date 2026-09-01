import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { transcribeAudioWithGroq } from '@/lib/agent/transcribe'

describe('Whisper Audio Transcription (Groq)', () => {
  const originalFetch = globalThis.fetch
  const originalGroqKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GROQ_API_KEY = 'gsk_test_mock_key'
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.GROQ_API_KEY = originalGroqKey
  })

  it('lanza error si GROQ_API_KEY no está configurada', async () => {
    delete process.env.GROQ_API_KEY
    const audioBuffer = Buffer.from('fake-audio-bytes')

    await expect(transcribeAudioWithGroq({ audioBuffer })).rejects.toThrow(
      'GROQ_API_KEY no está configurada',
    )
  })

  it('transcribe exitosamente un buffer de audio usando Groq Whisper', async () => {
    const mockTranscription = 'Hola, por favor crea unos aretes filigrana a cuarenta y cinco mil pesos'
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: mockTranscription }),
    } as any)

    const audioBuffer = Buffer.from('fake-ogg-audio-data')
    const result = await transcribeAudioWithGroq({
      audioBuffer,
      filename: 'voice.ogg',
      mimetype: 'audio/ogg',
    })

    expect(result).toBe(mockTranscription)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer gsk_test_mock_key',
        },
      }),
    )
  })

  it('maneja errores de la API de Groq adecuadamente', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    } as any)

    const audioBuffer = Buffer.from('fake-ogg-audio-data')
    await expect(
      transcribeAudioWithGroq({
        audioBuffer,
      }),
    ).rejects.toThrow('Error en Groq Whisper API (HTTP 429)')
  })
})
