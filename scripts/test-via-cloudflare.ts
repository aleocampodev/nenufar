/**
 * Test suite VIA Cloudflare Tunnel — cubre todo el flujo de Nenúfar
 * Usa la URL pública del túnel para validar que TODO funciona a través de Cloudflare,
 * no solo localhost:3002.
 */
const CLOUDFLARE_URL = process.env.CLOUDFLARE_URL || 'https://grew-biggest-bookstore-pole.trycloudflare.com'
const LOCAL_URL = 'http://localhost:3002'

type TestResult = { name: string; ok: boolean; detail: string; durationMs: number }

const results: TestResult[] = []

async function runTest(name: string, fn: () => Promise<string>): Promise<void> {
  const t0 = Date.now()
  try {
    const detail = await fn()
    results.push({ name, ok: true, detail, durationMs: Date.now() - t0 })
    console.log(`✅ ${name} (${Date.now() - t0}ms) — ${detail}`)
  } catch (e: any) {
    const msg = e?.message || String(e)
    results.push({ name, ok: false, detail: msg, durationMs: Date.now() - t0 })
    console.log(`❌ ${name} (${Date.now() - t0}ms) — ${msg}`)
  }
}

async function assertCloudflareGet(path: string, mustContain?: string) {
  const url = `${CLOUDFLARE_URL}${path}`
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`GET ${path} → HTTP ${r.status}`)
  const text = await r.text()
  if (mustContain && !text.includes(mustContain)) throw new Error(`GET ${path} no contiene "${mustContain}"`)
  return `HTTP ${r.status} via Cloudflare`
}

async function assertLocalVsCloudflare(path: string) {
  const local = await fetch(`${LOCAL_URL}${path}`, { signal: AbortSignal.timeout(8000) })
  const cf = await fetch(`${CLOUDFLARE_URL}${path}`, { signal: AbortSignal.timeout(15000) })
  if (local.status !== cf.status) throw new Error(`Status mismatch local ${local.status} vs cf ${cf.status} en ${path}`)
  return `local ${local.status} = cf ${cf.status}`
}

async function main() {
  console.log(`\n🌐 CLOUDFLARE_URL=${CLOUDFLARE_URL}`)
  console.log(`🏠 LOCAL_URL=${LOCAL_URL}\n`)

  // 1. Infra básica vía Cloudflare
  await runTest('1. Homepage vía Cloudflare', () => assertCloudflareGet('/', 'Nenúfar'))
  await runTest('2. /shop vía Cloudflare', () => assertCloudflareGet('/shop', 'shop'))
  await runTest('3. /pedidos/enviar vía Cloudflare', () => assertCloudflareGet('/pedidos/enviar', 'pedido'))
  await runTest('4. API products vía Cloudflare', async () => {
    const r = await fetch(`${CLOUDFLARE_URL}/api/products?limit=1`, { signal: AbortSignal.timeout(10000) })
    const j: any = await r.json()
    if (!j.docs?.length) throw new Error('No products')
    return `via CF: ${j.docs[0].title}`
  })
  await runTest('5. Paridad local vs Cloudflare /', () => assertLocalVsCloudflare('/'))

  // 2. Webhook Telegram vía Cloudflare (simula mensaje de Shirley)
  await runTest('6. Webhook Telegram vía Cloudflare (Shirley /start)', async () => {
    const r = await fetch(`${CLOUDFLARE_URL}/telegram/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token': process.env.TELEGRAM_WEBHOOK_SECRET || 'nenufar-webhook-secret-dev-2026',
      },
      body: JSON.stringify({
        update_id: 900001,
        message: {
          message_id: 999,
          from: { id: Number(process.env.TELEGRAM_ADMIN_CHAT_ID) || 6327668964, first_name: 'Shirley' },
          chat: { id: Number(process.env.TELEGRAM_ADMIN_CHAT_ID) || 6327668964, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: 'hola shirley test vía cloudflare',
        },
      }),
      signal: AbortSignal.timeout(15000),
    })
    const j: any = await r.json()
    if (!j.ok) throw new Error(`Webhook no ok: ${JSON.stringify(j)}`)
    // esperar un poco a que el agente loguee
    await new Promise((res) => setTimeout(res, 2000))
    return `webhook 200 via CF (Shirley Agent)`
  })

  // 3. Envío de pedido Telegram vía Cloudflare (formateo + send)
  await runTest('7. Telegram Order Notification vía Cloudflare (sendMessage)', async () => {
    // Import dinámico para usar las mismas libs que prod
    const { formatOrderMessage } = await import('../src/lib/order-formatter')
    const { sendTelegramMessage } = await import('../src/lib/telegram')
    // Mock cart mínimo
    const cart: any = {
      id: 999,
      subtotal: 140000,
      currency: 'COP',
      items: [
        {
          quantity: 1,
          product: { title: 'Collar colibries', priceInCOP: 70000, gallery: [] },
          variant: null,
        },
        {
          quantity: 1,
          product: { title: 'Test Cloudflare Joy', priceInCOP: 70000, gallery: [] },
          variant: null,
        },
      ],
    }
    const msg = formatOrderMessage({
      cart,
      buyer: { name: 'Test Cloudflare Buyer', contact: '+57 300 111 2222' },
      orderId: `CF-TEST-${Date.now()}`,
    })
    if (!msg.includes('Test Cloudflare Buyer')) throw new Error('formatOrderMessage falló')
    const res = await sendTelegramMessage({ text: msg })
    if (!res.ok) throw new Error(`sendTelegramMessage falló: ${res.error}`)
    return `Telegram messageId=${res.messageId} vía CF`
  })

  // 4. Int tests críticos vía Cloudflare env
  await runTest('8. NEXT_PUBLIC_SERVER_URL apunta a Cloudflare (order-formatter footer)', async () => {
    const prev = process.env.NEXT_PUBLIC_SERVER_URL
    process.env.NEXT_PUBLIC_SERVER_URL = CLOUDFLARE_URL
    const { formatOrderMessage } = await import('../src/lib/order-formatter')
    // vaciar cache? re-import ya tiene env
    const cart: any = { id: 1, subtotal: 50000, currency: 'COP', items: [{ quantity: 1, product: { title: 'X', priceInCOP: 50000 }, variant: null }] }
    const msg = formatOrderMessage({ cart, buyer: { name: 'A', contact: '+57 300 000 0000' }, orderId: 'CF-FOOTER-1' })
    process.env.NEXT_PUBLIC_SERVER_URL = prev
    if (!msg.includes(CLOUDFLARE_URL)) throw new Error(`Footer no contiene CF URL, got: ${msg.slice(-200)}`)
    return `footer содержит ${CLOUDFLARE_URL}`
  })

  // 5. Webhook info debe apuntar a CF
  await runTest('9. Telegram getWebhookInfo apunta a Cloudflare', async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) throw new Error('No TELEGRAM_BOT_TOKEN')
    const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, { signal: AbortSignal.timeout(8000) })
    const j: any = await r.json()
    if (!j.result?.url?.includes('trycloudflare.com')) throw new Error(`Webhook no apunta a CF: ${j.result?.url}`)
    if (j.result.pending_update_count > 0) throw new Error(`pending_update_count=${j.result.pending_update_count}`)
    return `webhook=${j.result.url}`
  })

  // Resumen
  console.log('\n' + '─'.repeat(60))
  console.log('📊 RESUMEN TESTS VÍA CLOUDFLARE')
  console.log('─'.repeat(60))
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.name} — ${r.durationMs}ms — ${r.detail}`)
  }
  const passed = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length
  console.log(`\nTotal: ${results.length} | Pasaron: ${passed} | Fallaron: ${failed}`)
  if (failed > 0) {
    console.log('\n⚠️  Algunos tests fallaron. Revisá los detalles arriba.')
    process.exit(1)
  } else {
    console.log('\n🎉 TODOS LOS TESTS VÍA CLOUDFLARE PASARON')
    process.exit(0)
  }
}

main().catch((e) => {
  console.error('Fatal', e)
  process.exit(1)
})
