'use server'

import { db } from '@/db'
import { handoffSessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { getPayload } from 'payload'
import config from '@/payload.config'

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export async function sendMessageToChat(
  sessionCode: string | null,
  message: string,
  history: ChatMessage[]
) {
  try {
    // 1. If we don't have an active session code yet, try to find one in the message
    if (!sessionCode) {
      const codeMatch = message.toUpperCase().match(/AX-[A-Z2-9]{4}/)
      
      if (codeMatch) {
        const detectedCode = codeMatch[0]
        console.log(`[Chat] Rehydrating session using code: ${detectedCode}`)
        
        // Find session in database
        const session = await db.query.handoffSessions.findFirst({
          where: (sessions, { eq }) => eq(sessions.sessionCode, detectedCode),
        })

        if (session) {
          const cart = session.cartContext as any
          const product = cart?.product
          
          if (!product) {
            return {
              success: true,
              reply: `Hola, encontré el código de sesión **${detectedCode}** pero el carrito está vacío.`,
              sessionCode: detectedCode,
              isRehydrated: true,
              status: session.status,
            }
          }

          // Generate initial greeting with Gemini
          const productName = product.name
          const priceCop = product.price_cop
          const engraving = product.engraving

          let upsellItem = 'un pompón decorativo de lana hecho a mano'
          let upsellPrice = 15000
          if (productName.includes('Sombrero')) {
            upsellItem = 'un estuche protector rígido de caña flecha'
            upsellPrice = 35000
          } else if (productName.includes('Jarrón')) {
            upsellItem = 'un soporte de madera tallada'
            upsellPrice = 20000
          }

          const prompt = `
            Actúa como Shirley, la amable asistente de ventas de Agento.
            El cliente acaba de ingresar el código de compra: ${detectedCode}.
            Salúdalo amistosamente y confirma su pedido:
            - Producto: ${productName}
            - Precio: $${priceCop.toLocaleString('es-CO')} COP
            - Grabado personalizado: ${engraving ? `"${engraving}"` : 'Ninguno solicitado'}

            Luego, ofrécele de manera entusiasta pero cordial el siguiente producto adicional (Upsell):
            - Producto sugerido: ${upsellItem} por un valor de $${upsellPrice.toLocaleString('es-CO')} COP adicionales.
            Pregúntale si desea agregarlo a su pedido antes de generar el enlace de pago.
            Mantén la respuesta cálida, representativa de las artesanías colombianas y concisa.
          `

          const { text: reply } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
          })

          return {
            success: true,
            reply,
            sessionCode: detectedCode,
            isRehydrated: true,
            status: session.status,
          }
        } else {
          return {
            success: true,
            reply: `Hola, soy Shirley. No encontré ningún pedido activo con el código **${detectedCode}**. Por favor, verifica el código e inténtalo de nuevo.`,
            sessionCode: null,
            isRehydrated: false,
            status: null,
          }
        }
      } else {
        return {
          success: true,
          reply: `¡Hola! Soy Shirley, tu asistente de compras en Agento. 🇨🇴🛍️\n\nPor favor, escribe o pega tu código de compra (ejemplo: \`AX-H3B9\`) para rehidratar tu carrito y guiarte con el pago.`,
          sessionCode: null,
          isRehydrated: false,
          status: null,
        }
      }
    }

    // 2. If we already have an active session, process the conversation
    const session = await db.query.handoffSessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.sessionCode, sessionCode),
    })

    if (!session) {
      return {
        success: false,
        reply: 'Error: La sesión activa ya no existe en la base de datos.',
        sessionCode: null,
        isRehydrated: false,
        status: null,
      }
    }

    if (session.status === 'PAID') {
      return {
        success: true,
        reply: '¡Tu pedido ya está pagado! Estamos preparando tu hoja de despacho en el panel administrativo de Agento. Pronto recibirás tus artesanías.',
        sessionCode,
        isRehydrated: true,
        status: 'PAID',
      }
    }

    // Determine upsell based on product
    const cart = session.cartContext as any
    const product = cart?.product
    const productName = product?.name || 'producto'
    const priceCop = product?.price_cop || 0
    const engraving = product?.engraving || null

    let upsellItem = 'Llavero de pompón Wayuu'
    let upsellPrice = 15000
    if (productName.includes('Sombrero')) {
      upsellItem = 'Estuche protector de caña flecha'
      upsellPrice = 35000
    } else if (productName.includes('Jarrón')) {
      upsellItem = 'Soporte de madera tallada'
      upsellPrice = 20000
    }

    // Call Gemini to handle user response and check for upsell decisions
    const historyText = history
      .map((h) => `${h.role === 'user' ? 'Cliente' : 'Shirley'}: ${h.text}`)
      .join('\n')

    const systemPrompt = `
      Eres Shirley, la asistente de ventas experta en artesanías de la tienda Agento.
      Estás conversando con un cliente sobre su pedido de: ${productName} ($${priceCop.toLocaleString('es-CO')} COP).
      Grabado: ${engraving ? `"${engraving}"` : 'Ninguno'}.

      DETALLES DEL UPSELL DISPONIBLE:
      - Nombre: ${upsellItem}
      - Precio: $${upsellPrice.toLocaleString('es-CO')} COP

      Tu meta en esta etapa es:
      1. Determinar si el cliente acepta o rechaza el upsell en su mensaje actual.
      2. Si el cliente acepta el upsell o ya lo aceptó, indícalo claramente y dile que el total es de $${(priceCop + upsellPrice).toLocaleString('es-CO')} COP. Proporciona el enlace de pago simulación: https://checkout.wompi.co/l/mock-${sessionCode}
      3. Si el cliente rechaza el upsell, indícalo y dile que el total es de $${priceCop.toLocaleString('es-CO')} COP. Proporciona el enlace de pago simulación: https://checkout.wompi.co/l/mock-${sessionCode}
      4. Si la respuesta del cliente es vaga, haz una pregunta aclaratoria amable sobre el upsell.

      Instrucciones de formato especiales:
      - Al final de tu respuesta, si ya confirmaron el pedido (con o sin upsell), DEBES incluir exactamente el enlace de pago en el formato: "Enlace de pago seguro: https://checkout.wompi.co/l/mock-${sessionCode}"
      - Si aceptaron el upsell, escribe exactamente al inicio o final de tu mensaje el tag técnico: "[UPSELL: ACCEPTED]"
      - Si rechazaron el upsell, escribe exactamente el tag técnico: "[UPSELL: REJECTED]"
    `

    const { text: rawReply } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Historial de chat:\n${historyText}\n\nCliente: ${message}\nShirley:`,
    })

    // Parse technical tags and clean up the reply
    let reply = rawReply
    let upsellAccepted = false
    let upsellRejected = false

    if (reply.includes('[UPSELL: ACCEPTED]')) {
      upsellAccepted = true
      reply = reply.replace('[UPSELL: ACCEPTED]', '').trim()
    }
    if (reply.includes('[UPSELL: REJECTED]')) {
      upsellRejected = true
      reply = reply.replace('[UPSELL: REJECTED]', '').trim()
    }

    // 3. Update database if they made a decision
    if (upsellAccepted || upsellRejected) {
      const updatedCart = {
        ...cart,
        upsell: upsellAccepted
          ? {
              added: true,
              name: upsellItem,
              price_cop: upsellPrice,
            }
          : {
              added: false,
              name: upsellItem,
              price_cop: upsellPrice,
            },
        totalPrice: priceCop + (upsellAccepted ? upsellPrice : 0),
      }

      await db
        .update(handoffSessions)
        .set({
          cartContext: updatedCart,
          updatedAt: new Date(),
        })
        .where(eq(handoffSessions.sessionCode, sessionCode))
      
      console.log(`[Chat] Session ${sessionCode} cart updated. Upsell accepted: ${upsellAccepted}`)
    }

    return {
      success: true,
      reply,
      sessionCode,
      isRehydrated: true,
      status: session.status,
    }
  } catch (error: any) {
    console.error('[Chat ERROR] Failed to send message:', error)
    return {
      success: false,
      reply: 'Lo siento, ocurrió un error procesando tu mensaje. Por favor intenta de nuevo.',
      sessionCode,
      isRehydrated: true,
      status: null,
    }
  }
}

export async function simulateCheckout(sessionCode: string) {
  try {
    console.log(`[Checkout Simulation] Processing checkout for code: ${sessionCode}`)
    
    // 1. Get handoff session
    const session = await db.query.handoffSessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.sessionCode, sessionCode),
    })

    if (!session) {
      throw new Error(`Handoff session with code ${sessionCode} not found`)
    }

    const cart = session.cartContext as any
    const product = cart?.product
    const upsell = cart?.upsell
    const totalPrice = cart?.totalPrice || product?.price_cop || 0

    if (!product) {
      throw new Error('No product found in cart context')
    }

    // 2. Update handoff session status to PAID in DB
    await db
      .update(handoffSessions)
      .set({
        status: 'PAID',
        wompiTransactionId: `wompi_tx_${Math.floor(100000000 + Math.random() * 900000000)}`,
        updatedAt: new Date(),
      })
      .where(eq(handoffSessions.sessionCode, sessionCode))

    // 3. Create a Document in Payload CMS "orders" collection
    const payload = await getPayload({ config })
    const orderDoc = await payload.create({
      collection: 'orders',
      data: {
        sessionCode: sessionCode,
        productName: product.name,
        price_cop: product.price_cop,
        engraving: product.engraving || '',
        upsellAdded: !!upsell?.added,
        upsellName: upsell?.added ? upsell.name : '',
        totalPrice: totalPrice,
        status: 'PAID',
        phone: session.phone || '573000000000',
        wompiTransactionId: `wompi_tx_${Math.floor(100000000 + Math.random() * 900000000)}`,
      },
    })

    console.log(`[Checkout Simulation] Successfully recorded paid Order in Payload CMS (ID: ${orderDoc.id})`)
    
    return {
      success: true,
      order: orderDoc,
    }
  } catch (error: any) {
    console.error('[Checkout Simulation ERROR] Failed:', error)
    return {
      success: false,
      error: error?.message || 'Checkout failed',
    }
  }
}
