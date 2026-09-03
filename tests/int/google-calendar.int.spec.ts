import { describe, it, expect } from 'vitest'
import {
  parseIcalEvents,
  parseIcalDate,
  unescapeIcalText,
  inferEventType,
} from '@/lib/google-calendar'

describe('Google Calendar iCal Parser (Shirley Workshops & Fairs)', () => {
  it('unescapes RFC 5545 special character sequences', () => {
    expect(unescapeIcalText('Hola\\, mundo\\; prueba\\nlinea dos\\\\fin')).toBe(
      'Hola, mundo; prueba\nlinea dos\\fin',
    )
  })

  it('parses UTC dates ending with Z', () => {
    const parsed = parseIcalDate('20260915T153000Z')
    expect(parsed).toBe('2026-09-15T15:30:00.000Z')
  })

  it('parses all-day 8-digit dates with Colombia timezone offset (-05:00)', () => {
    const parsed = parseIcalDate('20260920')
    expect(parsed).toBe('2026-09-20T10:00:00-05:00')
  })

  it('parses local datetime strings without Z', () => {
    const parsed = parseIcalDate('20260922T140000')
    expect(parsed).toBe('2026-09-22T14:00:00-05:00')
  })

  it('correctly infers event types (taller, feria, pop-up)', () => {
    expect(inferEventType('Taller de hilado en mostacilla')).toBe('taller')
    expect(inferEventType('Workshop vivencial')).toBe('taller')
    expect(inferEventType('Pop-Up en Getsemaní')).toBe('pop-up')
    expect(inferEventType('Feria artesanal San Pedro Claver')).toBe('feria')
    expect(inferEventType('Muestra artesanal')).toBe('feria')
  })

  it('parses a full Google Calendar iCal feed with unfolded lines and multiple events', () => {
    const sampleIcs = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Talleres Shirley - Nénufar
X-WR-TIMEZONE:America/Bogota
BEGIN:VEVENT
DTSTART:20260915T150000Z
DTEND:20260915T190000Z
UID:event-1@google.com
DESCRIPTION:Shirley presentará su colección completa de Okamas y 
 Otapas ceremoniales en Cartagena.
LOCATION:Plaza de San Pedro Claver\\, Cartagena de Indias
SUMMARY:Feria Artesanal del Centro Histórico
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=America/Bogota:20260922T100000
DTEND;TZID=America/Bogota:20260922T130000
UID:event-2@google.com
DESCRIPTION:Aprende a tejer micro-mostacilla con Shirley.
LOCATION:Taller Nénufar\\, Getsemaní\\, Cartagena
SUMMARY:Taller Vivencial de Tejido Emberá
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART:20260928T160000Z
UID:cancelled-event@google.com
SUMMARY:Evento Cancelado
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`

    const events = parseIcalEvents(sampleIcs)

    expect(events.length).toBe(2)

    // Event 1 (Feria)
    expect(events[0].id).toBe('event-1@google.com')
    expect(events[0].title).toBe('Feria Artesanal del Centro Histórico')
    expect(events[0].date).toBe('2026-09-15T15:00:00.000Z')
    expect(events[0].location).toBe('Plaza de San Pedro Claver, Cartagena de Indias')
    expect(events[0].description).toBe(
      'Shirley presentará su colección completa de Okamas y Otapas ceremoniales en Cartagena.',
    )
    expect(events[0].type).toBe('feria')

    // Event 2 (Taller)
    expect(events[1].id).toBe('event-2@google.com')
    expect(events[1].title).toBe('Taller Vivencial de Tejido Emberá')
    expect(events[1].date).toBe('2026-09-22T10:00:00-05:00')
    expect(events[1].location).toBe('Taller Nénufar, Getsemaní, Cartagena')
    expect(events[1].type).toBe('taller')
  })

  it('returns empty array when given invalid or empty ICS content', () => {
    expect(parseIcalEvents('')).toEqual([])
    expect(parseIcalEvents('INVALID')).toEqual([])
  })
})
