/**
 * Cliente Groq — solo servidor.
 *
 * Groq es el "cerebro" del bot asistente: hace la generación y el tool-calling.
 * Free tier — ver console.groq.com. NO hace embeddings (eso es fase de RAG).
 */
import Groq from 'groq-sdk'

let client: Groq | null = null

export function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY no está configurada')
  }
  if (!client) {
    client = new Groq({ apiKey })
  }
  return client
}

/** Modelo por defecto. Los ids de Groq rotan — se puede sobreescribir por env. */
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
