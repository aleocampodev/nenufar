'use server'

import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { db } from '@/db'
import { handoffSessions } from '@/db/schema'
import { eq } from 'drizzle-orm'

// ─── Upsell catalog ────────────────────────────────────────────
const UPSELL_MAP: Record<string, { name: string; price_cop: number }> = {
  default: { name: 'Llavero de pompón Wayuu', price_cop: 15000 },
  mochila: { name: 'Llavero de pompón Wayuu', price_cop: 15000 },
  sombrero: { name: 'Estuche protector de caña flecha', price_cop: 35000 },
  jarrón: { name: 'Soporte de madera tallada', price_cop: 20000 },
  jarro: { name: 'Soporte de madera tallada', price_cop: 20000 },
}

function getUpsell(productName: string) {
  const lower = productName.toLowerCase()
  for (const [key, value] of Object.entries(UPSELL_MAP)) {
    if (key !== 'default' && lower.includes(key)) return value
  }
  return UPSELL_MAP.default
}

// ─── Helpers ───────────────────────────────────────────────────
async function getSession(code: string) {
  return db.query.handoffSessions.findFirst({
    where: (s, { eq }) => eq(s.sessionCode, code),
  })
}

// ─── Route Handler ─────────────────────────────────────────────
export async function POST(req: Request) {
  const { messages, sessionCode } = await req.json()

  // Load session context if we have a code
  let session: Awaited<ReturnType<typeof getSession>> | null = null
  if (sessionCode) {
    session = await getSession(sessionCode)
  }

  // Check if latest user message contains a handoff code (Pre-LLM Guardian)
  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')
  let userText = ''
  if (lastUserMessage?.parts) {
    userText = lastUserMessage.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('\n')
  } else if (lastUserMessage?.content) {
    userText = typeof lastUserMessage.content === 'string'
      ? lastUserMessage.content
      : Array.isArray(lastUserMessage.content)
        ? lastUserMessage.content
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('\n')
        : ''
  }
  const codeMatch = userText.toUpperCase().match(/AX-[A-Z2-9]{4}/)
  const detectedCode = codeMatch ? codeMatch[0] : null

  let activeSession = session
  if (!activeSession && detectedCode) {
    activeSession = await getSession(detectedCode)
  }

  // Update activeChannel to WEB for web-initiated interactions
  if (activeSession) {
    try {
      const { db } = await import('@/db')
      const { handoffSessions } = await import('@/db/schema')
      const { eq } = await import('drizzle-orm')
      await db
        .update(handoffSessions)
        .set({ activeChannel: 'WEB', lastInteractionAt: new Date(), updatedAt: new Date() })
        .where(eq(handoffSessions.sessionCode, activeSession.sessionCode))
    } catch (e) {
      console.error('[chat/route] Failed to update activeChannel:', e)
    }
  }

  const cart = activeSession?.cartContext as any
  const product = cart?.product
  const upsellInfo = product ? getUpsell(product.name) : null
  const upsellAlreadyDecided = cart?.upsell !== undefined

  // ─── System Prompt ─────────────────────────────────────────
  const systemPrompt = activeSession && product
    ? `Eres Shirley, agente de ventas de Agento. Tu tarea es guiar al cliente colombiano hacia el pago de forma cálida, directa y profesional.

CONTEXTO DEL PEDIDO:
- Producto: ${product.name}
- Precio: $${Number(product.price_cop).toLocaleString('es-CO')} COP
- Grabado: ${product.engraving ? `"${product.engraving}"` : 'Sin grabado'}
- Código de sesión: ${activeSession.sessionCode}
- Estado: ${activeSession.status}
- Imagen del producto: ${product.images?.[0]?.url || ''}

${upsellInfo && !upsellAlreadyDecided ? `UPSELL DISPONIBLE:
- Nombre: ${upsellInfo.name}
- Precio adicional: $${Number(upsellInfo.price_cop).toLocaleString('es-CO')} COP
` : ''}

${cart?.upsell ? `UPSELL: ${cart.upsell.added ? `ACEPTADO (${cart.upsell.name} +$${Number(cart.upsell.price_cop).toLocaleString('es-CO')})` : 'RECHAZADO'}` : ''}

TOTAL A PAGAR: $${Number(cart?.totalPrice || product.price_cop).toLocaleString('es-CO')} COP

INSTRUCCIONES:
1. Cuando el cliente envía el código de sesión, usa la herramienta showProductCard para confirmar el pedido visualmente, pasando también el parámetro \`productImageUrl\` si está disponible.
2. Si hay upsell disponible y no se ha decidido, usa showUpsellCard justo después de showProductCard.
3. Cuando el cliente acepta o rechaza el upsell, actualiza el total y usa showCheckoutCard.
4. Si el cliente ya decidió el upsell, ve directo a showCheckoutCard.
5. Usa texto breve y cálido entre las tarjetas. No repitas la info que ya está en las tarjetas.
6. Nunca inventes precios o productos. Usa solo los datos del CONTEXTO.`
    : `Eres Shirley, agente de ventas de Agento para artesanías colombianas 🇨🇴.
Tu única función ahora es pedir el código de sesión en formato AX-XXXX.
Sé amigable y breve. No hagas nada más hasta recibir el código.`

  const modelMessages = await convertToModelMessages(messages)

  // ─── Stream ────────────────────────────────────────────────
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: modelMessages,
    tools: {
      // Shows product confirmation card
      showProductCard: tool({
        description: 'Muestra una tarjeta visual confirmando el producto del pedido rehidratado.',
        inputSchema: z.object({
          productName: z.string(),
          priceCop: z.number(),
          engraving: z.string().nullable(),
          sessionCode: z.string(),
          productImageUrl: z.string().optional(),
        }),
        execute: async () => ({ shown: true }),
      }),

      // Shows upsell offer card with Yes/No buttons
      showUpsellCard: tool({
        description: 'Muestra una tarjeta de oferta de producto complementario con botones de aceptar/rechazar.',
        inputSchema: z.object({
          upsellName: z.string(),
          upsellPriceCop: z.number(),
          sessionCode: z.string(),
        }),
        execute: async () => ({ shown: true }),
      }),

      // Updates upsell decision in DB and shows checkout summary
      showCheckoutCard: tool({
        description: 'Muestra el resumen final del pedido con el total y el botón de pago simulado.',
        inputSchema: z.object({
          productName: z.string(),
          productPriceCop: z.number(),
          upsellName: z.string().nullable(),
          upsellPriceCop: z.number().nullable(),
          totalPriceCop: z.number(),
          sessionCode: z.string(),
        }),
        execute: async ({ sessionCode: code, upsellName, upsellPriceCop, totalPriceCop, productName, productPriceCop }: {
          sessionCode: string
          upsellName: string | null
          upsellPriceCop: number | null
          totalPriceCop: number
          productName: string
          productPriceCop: number
        }) => {
          // Persist upsell decision to DB
          try {
            const currentSession = await getSession(code)
            if (currentSession) {
              const currentCart = currentSession.cartContext as any
              const upsellAdded = upsellName !== null

              await db
                .update(handoffSessions)
                .set({
                  cartContext: {
                    ...currentCart,
                    upsell: {
                      added: upsellAdded,
                      name: upsellName,
                      price_cop: upsellPriceCop,
                    },
                    totalPrice: totalPriceCop,
                  },
                  status: 'CHECKOUT_PENDING',
                  lastInteractionAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(handoffSessions.sessionCode, code))
            }
          } catch (e) {
            console.error('[chat/route] Failed to update checkout state:', e)
          }
          return { shown: true }
        },
      }),
    },
    stopWhen: stepCountIs(5), // allow multi-step tool chaining
    onError: (error) => {
      console.error('[chat/route] streamText error:', error)
    },
  })

  return result.toUIMessageStreamResponse()
}
