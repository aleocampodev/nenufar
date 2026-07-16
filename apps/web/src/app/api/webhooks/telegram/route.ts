import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const SHIRLEY_TELEGRAM_CHAT_ID = process.env.SHIRLEY_TELEGRAM_CHAT_ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const SESSION_CODE_REGEX = /^AX-[A-Z2-9]{4}$/

export async function POST(req: NextRequest) {
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (!secret || secret !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const update = await req.json()
  const message = update?.message
  if (!message) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message?.from?.id
  if (String(chatId) !== String(SHIRLEY_TELEGRAM_CHAT_ID)) {
    await sendTelegramMessage(chatId, 'No autorizado')
    return NextResponse.json({ ok: true })
  }

  const text: string | undefined = message.text
  if (text && text.startsWith('/')) {
    const [command, ...args] = text.trim().split(/\s+/)
    const codeArg = args.find((a) => SESSION_CODE_REGEX.test(a))

    switch (command) {
      case '/help':
        await sendTelegramMessage(chatId, HELP_TEXT)
        break
      case '/pagado':
      case '/despachado':
      case '/pedido':
        if (!codeArg) {
          await sendTelegramMessage(chatId, 'Código inválido. Formato esperado: AX-XXXX')
          break
        }
        await sendTelegramMessage(
          chatId,
          `TODO: ${command} sobre ${codeArg} → implementar mutation idempotente en @nenufar/telegram`,
        )
        break
      case '/pendientes':
        await sendTelegramMessage(chatId, 'TODO: /pendientes → query Payload orders')
        break
      case '/nuevo':
        await sendTelegramMessage(chatId, 'TODO: /nuevo parser → implementar en @nenufar/telegram')
        break
      default:
        await sendTelegramMessage(chatId, 'No entendí. Envía /help para ver comandos.')
    }
    return NextResponse.json({ ok: true })
  }

  if (message.photo) {
    await sendTelegramMessage(
      chatId,
      'TODO: photo-to-draft → getFile + upload a Supabase Storage + draft product en Payload',
    )
    return NextResponse.json({ ok: true })
  }

  await sendTelegramMessage(chatId, 'No entendí. Envía /help para ver comandos.')
  return NextResponse.json({ ok: true })
}

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      },
    )
  } catch {
    // Silently ignore network errors in the stub — wiring comes later.
  }
}

const HELP_TEXT = `Comandos disponibles:
/nuevo — Registrar pedido (multiples líneas)
/pagado AX-XXXX — Confirmar pago
/despachado AX-XXXX — Marcar despachado
/pedido AX-XXXX — Ver estado de pedido
/pendientes — Ver pedidos pendientes
/help — Ver esta ayuda
📸 Foto — Crear draft de producto`