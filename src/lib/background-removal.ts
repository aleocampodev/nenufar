/**
 * Background removal client using withoutBG service running on Oracle Cloud VM Always Free.
 *
 * In accordance with Constitution Art. I ($0/mo cost policy):
 * Runs open-weights withoutBG model on Oracle VM over Cloudflare Tunnel.
 * Never calls paid third-party background removal APIs.
 */

const WITHOUTBG_URL =
  process.env.WITHOUTBG_SERVICE_URL || 'https://confident-alias-retreat-forth.trycloudflare.com'

/**
 * Removes the background of an image given its public URL.
 * Returns the transparent PNG Buffer, or null if service is unavailable/times out.
 */
export async function removeImageBackground(imageUrl: string): Promise<Buffer | null> {
  const endpoint = `${WITHOUTBG_URL.replace(/\/$/, '')}/remove-bg`

  try {
    const controller = new AbortController()
    // 55s timeout: must fit within Telegram/Vercel serverless limits
    const timeout = setTimeout(() => controller.abort(), 55_000)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error(`[withoutbg] Service returned status ${response.status}: ${errText}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error('[withoutbg] Failed to remove background:', err)
    return null
  }
}
