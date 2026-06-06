import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToChat } from '@/app/actions/chat'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, text, sessionCode } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Missing "text" field in request body' },
        { status: 400 }
      )
    }

    console.log(`[WhatsApp Webhook Webhook] Received message from ${from || 'unknown'}: "${text}" (Session: ${sessionCode || 'none'})`)

    // Call the same logic we use in the chat actions
    const res = await sendMessageToChat(sessionCode || null, text, [])

    return NextResponse.json({
      messaging_product: 'whatsapp',
      contacts: [
        {
          input: from || '573000000000',
          wa_id: from || '573000000000',
        },
      ],
      messages: [
        {
          from: 'shirley_agent',
          text: {
            body: res.reply,
          },
          sessionCode: res.sessionCode,
          isRehydrated: res.isRehydrated,
          status: res.status,
        },
      ],
    })
  } catch (error: any) {
    console.error('[WhatsApp Webhook ERROR] Failed to process:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'whatsapp-webhook-simulator',
  })
}
