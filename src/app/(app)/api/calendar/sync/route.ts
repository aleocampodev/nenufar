import { NextResponse } from 'next/server'
import { fetchGoogleCalendarEvents } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryUrl = searchParams.get('url')

  const result = await fetchGoogleCalendarEvents(queryUrl)

  const isConfigured = Boolean(queryUrl || process.env.GOOGLE_CALENDAR_ICAL_URL)

  return NextResponse.json({
    ok: !result.error,
    configured: isConfigured,
    source: result.events.length > 0 ? 'google-calendar' : isConfigured ? 'google-calendar-empty' : 'none',
    urlUsed: result.urlUsed ? maskUrl(result.urlUsed) : null,
    eventsCount: result.events.length,
    events: result.events,
    error: result.error || null,
  })
}

export async function POST(request: Request) {
  let customUrl: string | null = null
  try {
    const body = await request.json()
    customUrl = body?.url || null
  } catch {
    // Body is optional
  }

  const result = await fetchGoogleCalendarEvents(customUrl)
  const isConfigured = Boolean(customUrl || process.env.GOOGLE_CALENDAR_ICAL_URL)

  return NextResponse.json({
    ok: !result.error,
    configured: isConfigured,
    source: result.events.length > 0 ? 'google-calendar' : isConfigured ? 'google-calendar-empty' : 'none',
    urlUsed: result.urlUsed ? maskUrl(result.urlUsed) : null,
    eventsCount: result.events.length,
    events: result.events,
    error: result.error || null,
  })
}

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Mask private calendar tokens in the path if present
    const maskedPath = parsed.pathname.replace(/(private-[a-f0-9]{8})[a-f0-9]+/i, '$1••••••••')
    return `${parsed.protocol}//${parsed.host}${maskedPath}`
  } catch {
    return url
  }
}
