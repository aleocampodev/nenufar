/**
 * Supabase Storage Integration for Payload Media (Cloud Storage).
 * Uploads, syncs, and removes media files and variants from Supabase Storage bucket.
 */
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbzfhqmagzmtlgtolioa.supabase.co'
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'

export function getSupabasePublicUrl(filename: string): string {
  if (!filename) return ''
  // Clean clean base filename
  const clean = path.basename(filename)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${clean}`
}

export async function uploadToSupabaseStorage({
  filename,
  buffer,
  mimeType = 'image/jpeg',
}: {
  filename: string
  buffer: Buffer | Uint8Array
  mimeType?: string
}): Promise<string | null> {
  if (!SUPABASE_KEY) {
    return null
  }

  const cleanFilename = path.basename(filename)
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${cleanFilename}`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer as any,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`[Supabase Storage] Upload failed for ${cleanFilename}: ${res.status} - ${errText}`)
      return null
    }

    return getSupabasePublicUrl(cleanFilename)
  } catch (err) {
    console.error(`[Supabase Storage] Error uploading ${cleanFilename}:`, err)
    return null
  }
}

export async function deleteFromSupabaseStorage(filename: string): Promise<boolean> {
  if (!SUPABASE_KEY || !filename) return false

  const cleanFilename = path.basename(filename)
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${cleanFilename}`

  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })
    return res.ok
  } catch (err) {
    console.error(`[Supabase Storage] Error deleting ${cleanFilename}:`, err)
    return false
  }
}
