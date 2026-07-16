import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SIGNING_KEY

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron] daily-digest triggered at 09:00 America/Bogota — TODO: query Payload orders yesterday + send digest to Shirley via Telegram Bot API')
  return NextResponse.json({ ok: true, scheduled: true })
}