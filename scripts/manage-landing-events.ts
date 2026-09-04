import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

/**
 * Script de gestión exclusiva de Ferias, Talleres y Eventos de la Landing Page.
 * Forma parte de la skill `landing-content-manager`.
 * 
 * Uso:
 *   pnpm tsx scripts/manage-landing-events.ts list
 *   pnpm tsx scripts/manage-landing-events.ts add --title "..." --date "..." --location "..." [--type "taller|feria"] [--description "..."]
 *   pnpm tsx scripts/manage-landing-events.ts delete --id <ID>
 */
async function main() {
  const args = process.argv.slice(2)
  const action = args[0] || 'list'

  const payload = await getPayload({ config })

  if (action === 'list') {
    console.log('\n📅 Consultando Ferias y Talleres activos en la Landing Page...\n')
    const res = await payload.find({
      collection: 'events',
      depth: 0,
      limit: 50,
      sort: 'date',
      overrideAccess: true,
    })

    if (!res.docs.length) {
      console.log('ℹ️  No hay eventos registrados en la Landing Page.')
      return
    }

    console.table(
      res.docs.map((ev: any) => ({
        ID: ev.id,
        Título: ev.title,
        Tipo: ev.type || 'taller',
        Fecha: ev.date,
        Ubicación: ev.location,
      }))
    )
    console.log(`\nTotal: ${res.totalDocs} evento(s) en la Landing.\n`)
    return
  }

  if (action === 'add') {
    const getArg = (flag: string): string | undefined => {
      const idx = args.indexOf(flag)
      return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined
    }

    const title = getArg('--title')
    const dateStr = getArg('--date')
    const location = getArg('--location') || 'Cartagena de Indias'
    const type = (getArg('--type') as 'taller' | 'feria') || 'feria'
    const description = getArg('--description') || ''

    if (!title || !dateStr) {
      console.error('❌ Error: Debes especificar al menos --title y --date (ej. --title "Feria Caribe" --date "2026-10-15T10:00:00-05:00")')
      process.exit(1)
    }

    const newEvent = await payload.create({
      collection: 'events',
      data: {
        title,
        date: new Date(dateStr).toISOString(),
        location,
        type,
        description,
      },
      overrideAccess: true,
    })

    console.log(`\n✅ Evento publicado con éxito en la Landing Page (ID: ${newEvent.id}):`)
    console.log(`   Título: ${newEvent.title}`)
    console.log(`   Tipo: ${newEvent.type}`)
    console.log(`   Fecha: ${newEvent.date}`)
    console.log(`   Lugar: ${newEvent.location}\n`)
    return
  }

  if (action === 'delete') {
    const idx = args.indexOf('--id')
    const id = idx !== -1 ? args[idx + 1] : undefined

    if (!id) {
      console.error('❌ Error: Debes especificar el ID del evento a eliminar (--id <ID>)')
      process.exit(1)
    }

    await payload.delete({
      collection: 'events',
      id: Number(id),
      overrideAccess: true,
    })

    console.log(`\n🗑️  Evento con ID ${id} eliminado de la Landing Page con éxito.\n`)
    return
  }

  console.log('Comandos soportados: list, add, delete')
  process.exit(0)
}

main().catch((err) => {
  console.error('Error ejecutando script de eventos:', err)
  process.exit(1)
})
