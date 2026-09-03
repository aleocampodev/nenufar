import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Media } from '@/components/Media'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  description: 'Próximos eventos, ferias y talleres de Nenúfar en Cartagena y Colombia.',
  openGraph: mergeOpenGraph({
    title: 'Eventos | Nenúfar',
    url: '/eventos',
  }),
  title: 'Eventos | Nenúfar',
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  })
}

function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

export default async function EventosPage() {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()

  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      depth: 1,
      limit: 20,
      overrideAccess: false,
      sort: 'date',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { date: { greater_than_equal: now } },
        ],
      },
    }),
    payload.find({
      collection: 'events',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-date',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { date: { less_than: now } },
        ],
      },
    }),
  ])

  const upcomingEvents = upcoming.docs
  const pastEvents = past.docs

  return (
    <main className="container py-12 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-serif mb-4 text-neutral-900">Eventos</h1>
        <p className="text-xl text-neutral-600 font-light">
          Ferias, talleres y encuentros de Nenúfar
        </p>
      </header>

      {/* Próximos eventos */}
      {upcomingEvents.length > 0 ? (
        <section className="mb-16">
          <h2 className="text-2xl font-serif mb-6 text-neutral-800">Próximos eventos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event: any) => {
              const hasImage = event.image && typeof event.image === 'object'
              return (
                <article
                  key={event.id}
                  className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow"
                >
                  {hasImage ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Media
                        resource={event.image}
                        sizeName="card"
                        fill
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center">
                      <span className="text-5xl">🌸</span>
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <h3 className="font-serif text-lg text-foreground">{event.title}</h3>
                    {event.date && (
                      <p className="text-sm text-muted-foreground capitalize">
                        📅 {formatEventDate(event.date)} — {formatEventTime(event.date)}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-sm text-muted-foreground">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-brand hover:underline font-medium"
                      >
                        Más información →
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="mb-16 text-center py-16 border border-dashed border-neutral-300 rounded-xl">
          <p className="text-5xl mb-4">🌸</p>
          <h2 className="text-2xl font-serif mb-3 text-neutral-800">Próximamente</h2>
          <p className="text-neutral-600 max-w-md mx-auto">
            Estamos preparando nuevos eventos. Seguinos en Instagram para enterarte primero.
          </p>
          <a
            href="/#contacto"
            className="inline-block mt-6 px-6 py-3 bg-brand text-brand-foreground rounded-md hover:bg-brand-dark transition"
          >
            Contactanos
          </a>
        </section>
      )}

      {/* Eventos pasados */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-serif mb-6 text-neutral-500">Eventos anteriores</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event: any) => (
              <article key={event.id} className="p-4 rounded-xl border border-border/50 opacity-60">
                <h3 className="font-serif text-base text-foreground mb-1">{event.title}</h3>
                {event.date && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {formatEventDate(event.date)}
                  </p>
                )}
                {event.location && (
                  <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
