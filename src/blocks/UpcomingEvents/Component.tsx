import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

type Props = {
  title?: string
  limit?: number
  filterByType?: 'todos' | 'feria' | 'taller' | 'pop-up'
  id?: string
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  })
}

function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

export const UpcomingEventsBlock: React.FC<Props> = async ({
  title = 'Próximos Eventos',
  limit = 3,
  filterByType = 'todos',
  id,
}) => {
  let events: any[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const now = new Date().toISOString()

    const whereAnd: any[] = [
      { _status: { equals: 'published' } },
      { date: { greater_than_equal: now } },
    ]
    if (filterByType && filterByType !== 'todos') {
      whereAnd.push({ type: { equals: filterByType } })
    }

    const result = await payload.find({
      collection: 'events',
      depth: 1,
      limit,
      overrideAccess: true,
      sort: 'date',
      where: { and: whereAnd },
    })

    events = result.docs || []
  } catch (err) {
    console.error('Error fetching events in UpcomingEventsBlock:', err)
  }

  // Fallback events if database is not yet seeded
  if (!events || events.length === 0) {
    events = [
      {
        id: '1',
        type: 'taller',
        title: 'Taller de Tejido en Mostacilla Calibrada',
        date: '2026-09-12T15:00:00.000Z',
        location: 'Taller Shirley, Getsemaní, Cartagena',
        description: 'Aprende la técnica tradicional de tejido con mostacilla japonesa y diseño de patrones caribeños.',
        image: null,
      },
      {
        id: '2',
        type: 'feria',
        title: 'Feria Artesanal del Caribe',
        date: '2026-09-20T10:00:00.000Z',
        location: 'Plaza de San Pedro Claver, Cartagena',
        description: 'Encuentra nuestras piezas exclusivas de filigrana y mostacilla en el stand de Nenúfar.',
        image: null,
      },
      {
        id: '3',
        type: 'pop-up',
        title: 'Pop-Up de Joyería de Autor',
        date: '2026-10-05T16:00:00.000Z',
        location: 'Centro Histórico, Cartagena de Indias',
        description: 'Muestra exclusiva de la nueva colección de collares y pulseras tejidas a mano.',
        image: null,
      },
    ]
  }

  return (
    <section id={id || 'talleres'} className="py-20 md:py-28 bg-[#FAF8F5]/40 border-y border-neutral-100 scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Krafti */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B] font-semibold font-sans block">
            Experiencias en Cartagena
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
            {title || 'Talleres & Ferias Artesanales'}
          </h2>
          <div className="w-12 h-0.5 bg-brand mx-auto mt-4 rounded-full opacity-60" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event: any) => {
            const hasImage = event.image && typeof event.image === 'object'

            return (
              <article
                key={event.id}
                className="group rounded-3xl border border-border/80 overflow-hidden bg-white dark:bg-card hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                {/* Imagen del evento */}
                {hasImage ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <Media
                      resource={event.image}
                      sizeName="card"
                      fill
                      imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-brand/[0.04] flex items-center justify-center border-b border-border/40">
                    <span className="text-4xl filter drop-shadow-sm">🌸</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2.5">
                    {event.type && (
                      <span className="inline-block text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-brand/10 text-brand font-medium border border-brand/20">
                        {event.type === 'taller' ? 'Taller de Tejido' : event.type === 'pop-up' ? 'Pop-up Exclusivo' : 'Feria Artesanal'}
                      </span>
                    )}
                    <h3 className="font-serif text-xl leading-snug text-foreground group-hover:text-brand transition-colors font-medium">
                      {event.title}
                    </h3>

                    {event.date && (
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 font-light">
                        <span>📅</span>
                        <span className="capitalize">{formatEventDate(event.date)}</span>
                        <span>•</span>
                        <span>{formatEventTime(event.date)}</span>
                      </p>
                    )}

                    {event.location && (
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 font-light">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </p>
                    )}

                    {event.description && (
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed line-clamp-2 pt-1 font-light">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/#contacto"
                      className="inline-flex items-center text-xs tracking-wider uppercase font-medium text-brand hover:text-brand-dark transition-colors group-hover:translate-x-1 duration-300"
                    >
                      Apartar Cupo con Shirley →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/#contacto"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand hover:bg-brand-dark text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-[0_4px_20px_rgba(106,27,154,0.2)] hover:shadow-lg"
          >
            Consultar por Talleres Privados & Grupos
          </Link>
        </div>
      </div>
    </section>
  )
}
