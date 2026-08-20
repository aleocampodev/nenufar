/**
 * Registra / inspecciona / elimina el webhook del bot ASISTENTE de Telegram.
 *
 * Uso:
 *   pnpm tsx scripts/set-telegram-webhook.ts <https-url-publica>
 *   pnpm tsx scripts/set-telegram-webhook.ts info
 *   pnpm tsx scripts/set-telegram-webhook.ts delete
 *
 * La URL pública viene de un túnel gratis, por ejemplo:
 *   cloudflared tunnel --url http://localhost:3002
 *   (o: npx localtunnel --port 3002 / ngrok http 3002)
 */
import 'dotenv/config'

const token = process.env.TELEGRAM_ASSISTANT_BOT_TOKEN
const secret = process.env.TELEGRAM_WEBHOOK_SECRET

async function main(): Promise<void> {
  if (!token) {
    console.error('❌ Falta TELEGRAM_ASSISTANT_BOT_TOKEN en .env')
    process.exit(1)
  }

  const arg = process.argv[2]
  const api = (method: string) => `https://api.telegram.org/bot${token}/${method}`

  if (arg === 'info') {
    const r = await fetch(api('getWebhookInfo'))
    console.log(JSON.stringify(await r.json(), null, 2))
    return
  }

  if (arg === 'delete') {
    const r = await fetch(api('deleteWebhook'))
    console.log(JSON.stringify(await r.json(), null, 2))
    return
  }

  if (!arg || !arg.startsWith('https://')) {
    console.error('Pasa la URL pública HTTPS del túnel, o "info" / "delete".')
    process.exit(1)
  }

  const webhookUrl = `${arg.replace(/\/$/, '')}/telegram/webhook`
  const body: Record<string, unknown> = { url: webhookUrl, allowed_updates: ['message'] }
  if (secret) body.secret_token = secret
  if (!secret) {
    console.warn('⚠️  Sin TELEGRAM_WEBHOOK_SECRET — el webhook quedará sin autenticar.')
  }

  const r = await fetch(api('setWebhook'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  console.log('setWebhook →', webhookUrl)
  console.log(JSON.stringify(await r.json(), null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
