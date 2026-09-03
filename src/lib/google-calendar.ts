import type { EventItem } from '@/blocks/UpcomingEvents/Calendar.client'

/**
 * Unescapes RFC 5545 text sequences.
 */
export function unescapeIcalText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim()
}

/**
 * Parses an iCal date string (UTC, date-only, or localized datetime) into an ISO string.
 * Default timezone offset for Shirley's events in Cartagena is Colombia Time (UTC-5 / -05:00).
 */
export function parseIcalDate(rawVal: string, defaultTzOffset: string = '-05:00'): string | null {
  if (!rawVal) return null
  const cleaned = rawVal.trim()

  // Case 1: UTC datetime (e.g. 20260915T150000Z)
  if (cleaned.endsWith('Z')) {
    const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
    if (match) {
      const [, y, m, d, h, min, s] = match
      return `${y}-${m}-${d}T${h}:${min}:${s}.000Z`
    }
  }

  // Case 2: All-day date (e.g. 20260915)
  if (/^\d{8}$/.test(cleaned)) {
    const y = cleaned.slice(0, 4)
    const m = cleaned.slice(4, 6)
    const d = cleaned.slice(6, 8)
    return `${y}-${m}-${d}T10:00:00${defaultTzOffset}`
  }

  // Case 3: Datetime without trailing Z (e.g. 20260915T100000)
  const localMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/)
  if (localMatch) {
    const [, y, m, d, h, min, s] = localMatch
    return `${y}-${m}-${d}T${h}:${min}:${s}${defaultTzOffset}`
  }

  // Case 4: Standard ISO fallback
  const parsed = new Date(cleaned)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  return null
}

/**
 * Infers event type (taller, feria, pop-up) based on title and description.
 */
export function inferEventType(title: string, description?: string | null): 'taller' | 'feria' | 'pop-up' {
  const combined = `${title || ''} ${description || ''}`.toLowerCase()
  if (
    combined.includes('taller') ||
    combined.includes('workshop') ||
    combined.includes('clase') ||
    combined.includes('tejido') ||
    combined.includes('aprende')
  ) {
    return 'taller'
  }
  if (combined.includes('pop-up') || combined.includes('popup') || combined.includes('showroom')) {
    return 'pop-up'
  }
  return 'feria'
}

/**
 * Parses raw iCal (.ics) string from Google Calendar into an array of EventItem.
 */
export function parseIcalEvents(icsContent: string): EventItem[] {
  if (!icsContent || typeof icsContent !== 'string') return []

  // 1. Unfold lines (RFC 5545: lines folded with CRLF + space/tab)
  const unfolded = icsContent
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .replace(/\r[ \t]/g, '')

  // 2. Extract VEVENT blocks
  const eventBlocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []
  const events: EventItem[] = []

  for (const block of eventBlocks) {
    const lines = block.split(/\r\n|\n|\r/)
    let uid = ''
    let title = ''
    let dateStr = ''
    let endDateStr = ''
    let location = ''
    let description = ''
    let status = 'CONFIRMED'

    for (const line of lines) {
      if (line.startsWith('UID:')) {
        uid = line.slice(4).trim()
      } else if (line.startsWith('SUMMARY:')) {
        title = unescapeIcalText(line.slice(8))
      } else if (line.startsWith('STATUS:')) {
        status = line.slice(7).trim().toUpperCase()
      } else if (line.startsWith('LOCATION:')) {
        location = unescapeIcalText(line.slice(9))
      } else if (line.startsWith('DESCRIPTION:')) {
        description = unescapeIcalText(line.slice(12))
      } else if (line.startsWith('DTSTART')) {
        const colonIdx = line.indexOf(':')
        if (colonIdx !== -1) {
          dateStr = line.slice(colonIdx + 1).trim()
        }
      } else if (line.startsWith('DTEND')) {
        const colonIdx = line.indexOf(':')
        if (colonIdx !== -1) {
          endDateStr = line.slice(colonIdx + 1).trim()
        }
      }
    }

    // Skip cancelled events or events without title/start date
    if (status === 'CANCELLED' || !title || !dateStr) {
      continue
    }

    const isoDate = parseIcalDate(dateStr)
    if (!isoDate) continue

    const isoEndDate = endDateStr ? parseIcalDate(endDateStr) : null

    events.push({
      id: uid || `gcal-${events.length + 1}`,
      title,
      date: isoDate,
      endDate: isoEndDate,
      location: location || 'Cartagena de Indias, Colombia',
      description: description || null,
      type: inferEventType(title, description),
    })
  }

  // Sort chronologically ascending
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Fetches and parses events from Shirley's Google Calendar iCal feed.
 * Cached using Next.js revalidation (default 5 minutes).
 */
export async function fetchGoogleCalendarEvents(
  customUrl?: string | null,
): Promise<{ events: EventItem[]; error?: string; urlUsed?: string }> {
  const targetUrl = customUrl || process.env.GOOGLE_CALENDAR_ICAL_URL

  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.startsWith('http')) {
    return {
      events: [],
      error: 'No se ha configurado la URL de iCal de Google Calendar (GOOGLE_CALENDAR_ICAL_URL).',
    }
  }

  try {
    const res = await fetch(targetUrl, {
      next: { revalidate: 300 }, // Cache 5 min
      headers: {
        Accept: 'text/calendar, text/plain, */*',
        'User-Agent': 'Nenufar-Web/3.3 (Cartagena, Colombia)',
      },
    })

    if (!res.ok) {
      return {
        events: [],
        error: `Error al obtener Google Calendar: HTTP ${res.status} ${res.statusText}`,
        urlUsed: targetUrl,
      }
    }

    const icsText = await res.text()
    const parsedEvents = parseIcalEvents(icsText)

    return {
      events: parsedEvents,
      urlUsed: targetUrl,
    }
  } catch (err: any) {
    console.warn('[GoogleCalendar] Error fetching iCal feed:', err)
    return {
      events: [],
      error: `Excepción de red al conectar con Google Calendar: ${err?.message || err}`,
      urlUsed: targetUrl,
    }
  }
}
