'use server'

import { db } from '@/db'
import { handoffSessions } from '@/db/schema'
import { getPayload } from 'payload'
import config from '@/payload.config'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // non-ambiguous characters
  let result = 'AX-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export interface CreateHandoffParams {
  productId: number
  engraving?: string
  phone?: string
}

export async function createHandoffSession(params: CreateHandoffParams) {
  try {
    const payload = await getPayload({ config })
    
    // 1. Fetch product to ensure it exists and get fresh details
    const product = await payload.findByID({
      collection: 'products',
      id: params.productId,
    })

    if (!product) {
      throw new Error(`Product with ID ${params.productId} not found`)
    }

    // 2. Generate a unique code
    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db.query.handoffSessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.sessionCode, code),
      })
      if (!existing) break
      code = generateCode()
      attempts++
    }

    // 3. Create the cart context
    const cartContext = {
      product: {
        id: Number(product.id),
        name: product.name,
        price_cop: product.price_cop,
        engraving: params.engraving || null,
      },
    }

    // Calculate expiry (e.g., 7 days from now)
    const ttlHours = Number(process.env.DEFAULT_HANDOFF_TTL_HOURS) || 168
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + ttlHours)

    // 4. Save to DB
    const [session] = await db
      .insert(handoffSessions)
      .values({
        sessionCode: code,
        cartContext: cartContext,
        status: 'ACTIVE',
        phone: params.phone || null,
        expiresAt: expiresAt,
        lastInteractionAt: new Date(),
      })
      .returning()

    console.log(`[Handoff] Created session ${session.id} with code ${code} for product "${product.name}"`)
    
    return {
      success: true,
      code,
      session,
    }
  } catch (error: any) {
    console.error('[Handoff ERROR] Failed to create handoff session:', error)
    return {
      success: false,
      error: error?.message || 'Failed to create session',
    }
  }
}
