/**
 * Script interactivo para probar las skills y herramientas del Bot de Shirley.
 *
 * Uso:
 *   pnpm tsx scripts/test-shirley-agent.ts "mensaje de Shirley"
 *   pnpm tsx scripts/test-shirley-agent.ts
 */
import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'
import { runShirleyAgent } from '../src/lib/agent/runShirleyAgent'
import { ANTHROPIC_SHIRLEY_TOOLS } from '../src/lib/agent/tools'
import readline from 'readline'

async function main() {
  const customQuery = process.argv.slice(2).join(' ').trim()

  console.log('\n🌸 ======================================================')
  console.log('🌸 NÉNUFAR — TEST HARNESS DEL AGENTE DE SHIRLEY (TELEGRAM)')
  console.log('🌸 Claude Agent SDK + LiteLLM + Groq Free ($0/mes)')
  console.log('🌸 ======================================================\n')

  console.log(`🛠️  Tools/Skills registradas (${ANTHROPIC_SHIRLEY_TOOLS.length}):`)
  ANTHROPIC_SHIRLEY_TOOLS.forEach((t, i) => {
    console.log(`   ${i + 1}. [${t.name}] — ${t.description.slice(0, 75)}...`)
  })
  console.log('\n🔄 Inicializando Payload CMS Local API...')

  const payload = await getPayload({ config })
  const adminChatId = Number(process.env.TELEGRAM_ADMIN_CHAT_ID) || 999999

  async function executeTest(promptText: string) {
    console.log(`\n💬 [Shirley dice]: "${promptText}"`)
    console.log('⏳ Ejecutando agente con Claude Agent SDK / LiteLLM...')
    const start = Date.now()

    const reply = await runShirleyAgent({
      text: promptText,
      payload,
      chatId: adminChatId,
    })

    const elapsed = ((Date.now() - start) / 1000).toFixed(2)
    console.log(`\n🤖 [Bot de Shirley responde (${elapsed}s)]:\n`)
    console.log(reply)
    console.log('\n------------------------------------------------------')
  }

  if (customQuery) {
    await executeTest(customQuery)
    process.exit(0)
  }

  console.log('\n💡 Escribe un mensaje para Shirley o escribe "menu" para ver ejemplos predefinidos.')
  console.log('💡 Escribe "salir" o presiona Ctrl+C para terminar.\n')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const ask = () => {
    rl.question('Mensaje > ', async (input) => {
      const line = input.trim()
      if (!line || line.toLowerCase() === 'salir' || line.toLowerCase() === 'exit') {
        rl.close()
        process.exit(0)
      }

      if (line.toLowerCase() === 'menu') {
        console.log('\n📋 Ejemplos de prueba rápidos:')
        console.log(' 1. "hola, ¿en qué me puedes ayudar hoy?"')
        console.log(' 2. "¿qué productos hay en el catálogo?"')
        console.log(' 3. "crea unos Aretes Filigrana Luna a 55000 pesos con 4 unidades"')
        console.log(' 4. "actualiza el inventario de aretes-filigrana-luna a 10 unidades y precio 60000"')
        console.log(' 5. "crea la categoría Anillos"')
        console.log(' 6. "qué categorías tenemos?"')
        console.log(' 7. "qué pedidos tengo pendientes?"')
        console.log(' 8. "dame ideas de copy para unos aretes de mostacilla caribeños"')
        console.log(' 9. "qué slides tenemos en el carrusel de la página de inicio?"\n')
        ask()
        return
      }

      try {
        await executeTest(line)
      } catch (err) {
        console.error('❌ Error en ejecución:', err)
      }
      ask()
    })
  }

  ask()
}

main().catch((err) => {
  console.error('Error fatal inicializando test harness:', err)
  process.exit(1)
})
