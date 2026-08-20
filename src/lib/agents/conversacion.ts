/**
 * Agente Conversación — atención general + handoff a Shirley.
 */
import { derivarAShirley } from './skills/derivarAShirley'
import type { Agent } from './types'

export const conversacionAgent: Agent = {
  name: 'conversacion',
  systemPrompt: [
    'Eres el asistente de atención de Nénufar, joyería artesanal de Shirley (Cartagena, Colombia).',
    'Atiendes saludos y dudas generales con calidez y brevedad, en español.',
    'Cuando la clienta quiera personalizar una pieza, comprar, o coordinar pago o envío,',
    'usa la skill derivarAShirley para pasarle el contacto a Shirley.',
    'Nunca cobres ni cierres ventas: Shirley personaliza y gestiona cada pedido a mano.',
  ].join(' '),
  skills: [derivarAShirley],
}
