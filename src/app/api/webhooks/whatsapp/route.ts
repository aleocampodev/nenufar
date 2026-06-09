import { NextRequest, NextResponse } from 'next/server'
import { streamText, tool, stepCountIs } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { db } from '@/db'
import { handoffSessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { searchProducts } from '@/lib/rag'
import { createHandoffSession } from '@/app/actions/handoff'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, text: userMessage, sessionCode } = body

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Missing "text" field in request body' },
        { status: 400 }
      )
    }

    console.log(`[WhatsApp Webhook] Received message from ${from || 'unknown'}: "${userMessage}" (Session: ${sessionCode || 'none'})`)

    // Check for handoff code in message
    const codeMatch = userMessage.toUpperCase().match(/AX-[A-Z2-9]{4}/)

    // Load existing session if available
    let activeSession = null
    if (sessionCode) {
      activeSession = await db.query.handoffSessions.findFirst({
        where: (s, { eq }) => eq(s.sessionCode, sessionCode),
      })
    }
    if (!activeSession && codeMatch) {
      activeSession = await db.query.handoffSessions.findFirst({
        where: (s, { eq }) => eq(s.sessionCode, codeMatch[0]),
      })
    }

    const cart = activeSession?.cartContext as {
      product?: { id: number; name: string; price_cop: number; engraving?: string | null }
    } | null
    const product = cart?.product

    const systemPrompt = activeSession && product
      ? `Eres Shirley, agente de ventas de Agento para artesanías colombianas. Estás conversando por WhatsApp.

CONTEXTO DEL PEDIDO:
- Producto: ${product.name}
- Precio: $${Number(product.price_cop).toLocaleString('es-CO')} COP
- Grabado: ${product.engraving ? `"${product.engraving}"` : 'Sin grabado'}
- Código de sesión: ${activeSession.sessionCode}
- Estado: ${activeSession.status}

Responde de forma cálida y concisa. Guía al cliente hacia el pago.`
      : `Eres Shirley, agente de ventas de Agento para artesanías colombianas. Estás conversando por WhatsApp.

INSTRUCCIONES:
1. Si el cliente busca productos, usa searchProducts para encontrar artesanías relevantes por descripción.
2. Cuando el cliente elige un producto, usa createHandoff para generar un código AX-XXXX y enviarle un link para continuar en la web.
3. Si el cliente envía un código AX-XXXX existente, confirma su pedido.
4. Si el cliente quiere pagar desde WhatsApp, genera el código y dile que puede pagar en agento.co/?session=AX-XXXX
5. Sé amable, breve, y usa emojis moderadamente.`

    // Build RAG tool for product search
    const tools: Record<string, any> = {
      searchProducts: tool({
        description: 'Busca productos de artesanías colombianas por descripción en lenguaje natural. Retorna hasta 4 resultados con similitud semántica.',
        inputSchema: z.object({
          query: z.string().describe('Descripción de lo que busca el cliente'),
        }),
        execute: async ({ query }: { query: string }) => {
          const results = await searchProducts(query)
          return results.map((r) => ({
            id: r.product.id,
            name: r.product.name,
            price_cop: r.product.price_cop,
            similarity: Math.round(r.similarity * 100),
          }))
        },
      }),
      createHandoff: tool({
        description: 'Genera un código de handoff AX-XXXX para un producto y opcionalmente un grabado. Esto congela el carrito y permite al cliente continuar en la web.',
        inputSchema: z.object({
          productId: z.number().describe('ID del producto elegido'),
          engraving: z.string().nullable().optional().describe('Texto de grabado personalizado, si aplica'),
        }),
        execute: async ({ productId, engraving }: { productId: number; engraving?: string | null }) => {
          const res = await createHandoffSession({
            productId,
            engraving: engraving || undefined,
            phone: from || undefined,
            initiatedFrom: 'WHATSAPP',
          })
          if (res.success) {
            return {
              code: res.code,
              pickupUrl: `agento.co/?session=${res.code}`,
            }
          }
          return { error: res.error }
        },
      }),
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      tools,
      stopWhen: stepCountIs(3),
    })

    const { text: reply } = await result

    // Update activeChannel on the session
    if (activeSession) {
      await db
        .update(handoffSessions)
        .set({ activeChannel: 'WHATSAPP', lastInteractionAt: new Date(), updatedAt: new Date() })
        .where(eq(handoffSessions.sessionCode, activeSession.sessionCode))
    }

    return NextResponse.json({
      messaging_product: 'whatsapp',
      contacts: [{ input: from || '573000000000', wa_id: from || '573000000000' }],
      messages: [{ from: 'shirley_agent', text: { body: reply } }],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[WhatsApp Webhook ERROR] Failed to process:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'whatsapp-webhook',
  })
}
