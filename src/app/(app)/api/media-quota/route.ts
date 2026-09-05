import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMediaStorageStats } from '@/lib/storageAlerts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const stats = await getMediaStorageStats(payload)

    return NextResponse.json({
      totalImages: stats.totalImages,
      usedBytes: stats.totalBytes,
      usedMB: stats.usedMB,
      limitMB: stats.limitMB,
      limitGB: stats.limitGB,
      percentUsed: stats.percentUsed,
      remainingMB: stats.remainingMB,
      estimatedImagesRemaining: stats.estimatedImagesRemaining,
      status: stats.status,
    })
  } catch (error) {
    console.error('Error fetching media quota stats:', error)
    return NextResponse.json(
      { error: 'Failed to calculate media storage stats' },
      { status: 500 }
    )
  }
}
