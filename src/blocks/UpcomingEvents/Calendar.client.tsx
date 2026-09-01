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
  // Siempre el mes actual en curso
  const [currentDate] = useState(() => new Date())
  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Filtrar eventos EXCLUSIVAMENTE del mes actual
  const monthEvents = (events || []).filter((ev) => {
    if (!ev || !ev.date) return false
    const d = new Date(ev.date)
    if (Number.isNaN(d.getTime())) return false
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  })

  // Obtener evento de un día específico
  const getEventForDay = (day: number) => {
    return monthEvents.find((ev) => {
      if (!ev || !ev.date) return false
      const d = new Date(ev.date)
      return d.getDate() === day
    })
  }

  // Evento activo en el mes visible
  const activeEvent =
    (selectedEventId ? monthEvents.find((ev) => ev && ev.id === selectedEventId) : null) ||
    monthEvents[0] ||
    null

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
    <div className="w-full bg-white border border-[#EADCCF]/80 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div>
        {/* Encabezado del Calendario (Fijo en el Mes Actual, Sin Flechas) */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal capitalize leading-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <span className="text-[11px] font-sans text-stone-500 font-light block">
                {monthEvents.length === 1
                  ? "1 taller o feria este mes"
                  : monthEvents.length > 1
                  ? `${monthEvents.length} talleres y ferias este mes`
                  : "Programación del mes en curso"}
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
            Mes en curso
          </span>
        </div>

        {/* Nombres de los Días */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAY_NAMES.map((d, idx) => (
            <span key={idx} className="text-[11px] font-sans font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Matriz de Días del Mes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-6">
          {/* Días vacíos previos */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[44px] h-11 rounded-xl" />
          ))}

          {/* Días del mes con mínimo 44px de altura táctil */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1
            const ev = getEventForDay(dayNumber)
            const hasEvent = !!ev
            const isSelected = activeEvent && ev && activeEvent.id === ev.id

            return (
              <button
                key={dayNumber}
                type="button"
                disabled={!hasEvent}
                onClick={() => ev && setSelectedEventId(ev.id)}
                className={`relative min-h-[44px] h-11 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 ${
                  hasEvent
                    ? isSelected
                      ? "bg-brand text-white shadow-md shadow-brand/25 font-bold scale-105"
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

      {/* Panel Descriptivo: Evento Seleccionado del Mes Actual */}
      {activeEvent ? (
        <div className="bg-[#FAF8F5] border border-[#EADCCF] rounded-2xl p-4 sm:p-6 transition-all duration-300">
          {/* Badge y Tipo */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
              <Sparkles className="w-3 h-3" />
              {activeEvent.type || "Feria Artesanal"}
            </span>
            {monthEvents.length > 1 && (
              <span className="text-[11px] text-stone-500 font-light">
                Toca los días marcados en el calendario para alternar
              </span>
            )}
          </div>

          {/* Título de la Feria */}
          <h4 className="font-serif text-lg sm:text-xl md:text-2xl text-stone-900 font-normal mb-3 leading-snug">
            {activeEvent.title}
          </h4>

          {/* Metadatos en Texto: Fecha, Horario y Lugar */}
          <div className="space-y-2 mb-3.5 text-xs sm:text-sm text-stone-700 font-light border-y border-stone-200/80 py-3">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-brand shrink-0" />
              <span className="capitalize">{formatFullDate(activeEvent.date)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <span>Horario: {formatTime(activeEvent.date)}</span>
            </div>
            {activeEvent.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span>Ubicación: {activeEvent.location}</span>
              </div>
            )}
          </div>

          {/* Relato y Descripción Editorial */}
          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            <p>
              {activeEvent.description ||
                "Shirley expondrá su colección exclusiva de Okamas y Otapas ceremoniales tejidos con micro-mostacilla checa en Cartagena."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-dashed border-[#EADCCF] rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-brand/5 text-brand/70 flex items-center justify-center mx-auto">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-base text-stone-800 font-medium">
              Próximos talleres en preparación
            </p>
            <p className="text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
              Estamos programando las fechas de este mes. Escríbenos directamente si deseas agendar un taller privado de tejido con Shirley en Getsemaní.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
