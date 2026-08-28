import configPromise from "@payload-config"
import { getPayload } from "payload"
import React from "react"
import { VideoPlayer } from "./VideoPlayer.client"
import { CalendarClient, EventItem } from "./Calendar.client"
import type { Media } from "@/payload-types"

interface UpcomingEventsBlockProps {
  tagline?: string | null
  title?: string | null
  description?: string | null
  video?: Media | string | null
  videoUrl?: string | null
  videoCaption?: string | null
  id?: string
}

export const UpcomingEventsBlock: React.FC<UpcomingEventsBlockProps> = async ({
  tagline = "EXPERIENCIAS & ENCUENTROS",
  title = "Talleres en Vivo & Próximas Ferias en Cartagena",
  description = "Vive el arte de tejer mostacilla en nuestro taller o encuéntranos en las ferias artesanales del Centro Histórico.",
  video,
  videoUrl,
  videoCaption,
  id,
}) => {
  let eventsList: EventItem[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: "events",
      depth: 1,
      limit: 12,
      overrideAccess: true,
      sort: "date",
      where: {
        _status: { equals: "published" },
      },
    })

    if (result.docs && result.docs.length > 0) {
      eventsList = result.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        date: doc.date,
        endDate: doc.endDate,
        location: doc.location,
        description: doc.description,
        type: doc.type,
      }))
    }
  } catch (err) {
    console.warn("[UpcomingEvents] Error fetching events:", err)
  }

  // Fallbacks de eventos si la colección aún no tiene registros
  if (eventsList.length === 0) {
    eventsList = [
      {
        id: "ev-1",
        title: "Feria Artesanal del Centro Histórico",
        date: "2026-08-15T15:00:00.000Z",
        location: "Plaza de San Pedro Claver, Cartagena de Indias",
        type: "feria",
        description:
          "Shirley presentará su colección completa de Okamas y Otapas ceremoniales tejidos en mostacilla checa calibrada. Un espacio al aire libre bajo la brisa caribeña para apreciar la técnica ancestral y llevarte una joya irrepetible.",
      },
      {
        id: "ev-2",
        title: "Taller Vivencial de Tejido Emberá",
        date: "2026-08-22T10:00:00.000Z",
        location: "Taller Nénufar, Getsemaní, Cartagena",
        type: "taller",
        description:
          "Experiencia íntima de 3 horas donde Shirley guía a cada participante paso a paso en el hilado y la geometría sagrada. Incluye micro-mostacillas checas, aguja técnica, refrigerio típico y tu propia pieza finalizada.",
      },
      {
        id: "ev-3",
        title: "Pop-Up Joyas de Autor & Café",
        date: "2026-08-29T16:00:00.000Z",
        location: "Calle del Espíritu Santo, Getsemaní",
        type: "pop-up",
        description:
          "Muestra especial de piezas únicas de autor en colaboración con café de origen colombiano. Shirley estará compartiendo la historia de cada collar y asesorando sobre la caída anatómica en el cuerpo.",
      },
    ]
  }

  const mediaObj = video as Media
  const hasVideoMedia = mediaObj && typeof mediaObj === "object" && mediaObj.url
  const finalVideoUrl = hasVideoMedia ? mediaObj.url : videoUrl

  return (
    <section id={id || "talleres"} className="w-full py-20 bg-[#141211] text-white border-t border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Encabezado Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          {tagline && (
            <span className="inline-block text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              {tagline}
            </span>
          )}
          {title && (
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-100 font-normal tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Cuadrícula de 2 Columnas: Video 9:16 + Calendario con Dropdown de Texto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Columna Izquierda: Video Vertical 9:16 */}
          <div className="lg:col-span-5 flex justify-center">
            <VideoPlayer videoUrl={finalVideoUrl} caption={videoCaption} />
          </div>

          {/* Columna Derecha: Calendario Interactivo con Dropdown de Texto */}
          <div className="lg:col-span-7">
            <CalendarClient events={eventsList} />
          </div>
        </div>
      </div>
    </section>
  )
}
