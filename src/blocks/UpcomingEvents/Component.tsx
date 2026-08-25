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
    overrideAccess: false,
    sort: 'date',
    where: { and: whereAnd },
  })

  const events = result.docs

  if (!events || events.length === 0) return null

  return (
    <section id={id} className="container py-12">
      <h2 className="text-3xl font-serif mb-8 text-foreground">{title}</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => {
          const hasImage = event.image && typeof event.image === 'object'

          return (
            <article
              key={event.id}
              className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow"
            >
              {/* Imagen del evento */}
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

              {/* Info */}
              <div className="p-5 space-y-2">
                {event.type && (
                  <span className="inline-block text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                    {event.type === 'taller' ? 'Taller' : event.type === 'pop-up' ? 'Pop-up' : 'Feria'}
                  </span>
                )}
                <h3 className="font-serif text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                {event.date && (
                  <p className="text-sm text-muted-foreground capitalize">
                    📅 {formatEventDate(event.date)}
                    {' — '}{formatEventTime(event.date)}
                  </p>
                )}

                {event.location && (
                  <p className="text-sm text-muted-foreground">
                    📍 {event.location}
                  </p>
                )}

                {event.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
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

      <div className="mt-8 text-center">
        <Link
          href="/eventos"
          className="inline-block px-6 py-3 border border-brand text-brand rounded-md hover:bg-brand hover:text-brand-foreground transition font-medium"
        >
          Ver todos los eventos
        </Link>
      </div>
    </section>
  )
}
