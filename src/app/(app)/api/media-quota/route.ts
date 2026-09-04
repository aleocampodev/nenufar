import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const db = (payload.db as any).drizzle

    // Fast query in PostgreSQL for exact count and byte sum of media
    let totalBytes = 0
    let totalImages = 0

    try {
      const res = await db.execute('SELECT COUNT(*)::int AS count, COALESCE(SUM(filesize), 0)::bigint AS bytes FROM media')
      if (res.rows && res.rows[0]) {
        totalImages = Number(res.rows[0].count || 0)
        totalBytes = Number(res.rows[0].bytes || 0)
      }
    } catch {
      // Fallback via Payload Local API if direct drizzle query is not available
      const mediaRes = await payload.find({
        collection: 'media',
        limit: 500,
        pagination: false,
      })
      totalImages = mediaRes.docs.length
      totalBytes = mediaRes.docs.reduce((acc, doc) => acc + (doc.filesize || 0), 0)
    }

    const usedMB = Number((totalBytes / (1024 * 1024)).toFixed(1))
    const limitMB = 1024 // 1 GB free on Supabase Storage
    const percentUsed = Number(((usedMB / limitMB) * 100).toFixed(1))
    const remainingMB = Number((limitMB - usedMB).toFixed(1))
    const avgImageMB = totalImages > 0 ? usedMB / totalImages : 0.35
    const estimatedImagesRemaining = Math.max(0, Math.floor(remainingMB / (avgImageMB || 0.35)))

    return NextResponse.json({
      totalImages,
      usedBytes: totalBytes,
      usedMB,
      limitMB,
      limitGB: 1,
      percentUsed,
      remainingMB,
      estimatedImagesRemaining,
      status: percentUsed > 90 ? 'danger' : percentUsed > 75 ? 'warning' : 'healthy',
    })
  } catch (error) {
    console.error('Error fetching media quota stats:', error)
    return NextResponse.json(
      { error: 'Failed to calculate media storage stats' },
      { status: 500 }
    )
  }
}
