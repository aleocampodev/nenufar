"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react"

export interface EventItem {
  id: string | number
  title: string
  date: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  type?: "feria" | "taller" | "pop-up" | string | null
}

interface CalendarClientProps {
  events: EventItem[]
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export const CalendarClient: React.FC<CalendarClientProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1)) // Agosto 2026
  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(
    events.length > 0 ? events[0].id : null
  )

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Filtrar eventos del mes actual
  const monthEvents = events.filter((ev) => {
    const d = new Date(ev.date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  })

  // Obtener evento de un día específico
  const getEventForDay = (day: number) => {
    return monthEvents.find((ev) => {
      const d = new Date(ev.date)
      return d.getDate() === day
    })
  }

  const selectedEvent = events.find((ev) => ev.id === selectedEventId) || events[0]

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Bogota",
    }).replace(/\u00a0|\u202f/g, ' ')
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
    }).replace(/\u00a0|\u202f/g, ' ')
  }

  return (
    <div className="w-full bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between">
      <div>
        {/* Encabezado del Calendario */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal capitalize">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nombres de los Días */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAY_NAMES.map((d, idx) => (
            <span key={idx} className="text-[11px] font-sans font-semibold uppercase tracking-wider text-stone-400 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Matriz de Días del Mes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-8">
          {/* Días vacíos previos */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-xl" />
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1
            const ev = getEventForDay(dayNumber)
            const hasEvent = !!ev
            const isSelected = ev && selectedEventId === ev.id

            return (
              <button
                key={dayNumber}
                disabled={!hasEvent}
                onClick={() => ev && setSelectedEventId(ev.id)}
                className={`relative h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 ${
                  hasEvent
                    ? isSelected
                      ? "bg-brand text-white shadow-md shadow-brand/30 font-bold scale-105"
                      : "bg-brand/10 text-brand hover:bg-brand/20 hover:scale-105 border border-brand/30 cursor-pointer font-semibold"
                    : "text-stone-400 cursor-default"
                }`}
              >
                <span>{dayNumber}</span>
                {hasEvent && (
                  <span
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-brand animate-pulse"
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dropdown / Panel de Texto Descriptivo del Evento Seleccionado */}
      {selectedEvent ? (
        <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-5 sm:p-6 transition-all duration-300">
          {/* Badge y Tipo */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-brand bg-brand/10 px-2.5 py-1 rounded-full border border-brand/20">
              <Sparkles className="w-3 h-3" />
              {selectedEvent.type || "Feria Artesanal"}
            </span>
            <span className="text-xs text-stone-500 font-light">
              Toca un día marcado en el calendario para cambiar de feria
            </span>
          </div>

          {/* Título de la Feria */}
          <h4 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal mb-3 leading-snug">
            {selectedEvent.title}
          </h4>

          {/* Metadatos en Texto: Fecha, Horario y Lugar */}
          <div className="space-y-2 mb-4 text-xs sm:text-sm text-stone-700 font-light border-y border-stone-200/80 py-3">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-brand shrink-0" />
              <span className="capitalize">{formatFullDate(selectedEvent.date)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <span>Horario: {formatTime(selectedEvent.date)}</span>
            </div>
            {selectedEvent.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span>Ubicación: {selectedEvent.location}</span>
              </div>
            )}
          </div>

          {/* Relato y Descripción Editorial (Puro Texto) */}
          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light space-y-2">
            <p>
              {selectedEvent.description ||
                "Shirley expondrá su colección exclusiva de Okamas y Otapas ceremoniales tejidos con micro-mostacilla checa en Cartagena. Los visitantes podrán apreciar el proceso de tejido a mano, conocer la cosmovisión Emberá y adquirir piezas únicas de colección."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center text-xs text-stone-500 font-light">
          Selecciona una fecha marcada en el calendario para leer el detalle de la feria o taller.
        </div>
      )}
    </div>
  )
}
