import type { Payload } from 'payload'
import { sendTelegramReply } from '@/lib/telegram'

export interface MediaStorageStats {
  totalImages: number
  totalBytes: number
  usedMB: number
  limitMB: number
  limitGB: number
  percentUsed: number
  remainingMB: number
  estimatedImagesRemaining: number
  status: 'healthy' | 'warning' | 'danger'
  topHeavyFiles: Array<{
    id: number | string
    alt: string
    filename: string
    filesize: number
    filesizeFormatted: string
    url?: string
  }>
}

/** Cache en memoria para evitar spam de alertas sucesivas por cada foto subida */
let lastAlertTimestamp = 0
let lastAlertPercent = 0
const ALERT_COOLDOWN_MS = 1000 * 60 * 60 * 12 // 12 horas de enfriamiento

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

/**
 * Calcula las estadísticas de almacenamiento de fotos en Supabase Storage (1 GB gratis).
 */
export async function getMediaStorageStats(
  payload: Payload,
  topCount = 5,
): Promise<MediaStorageStats> {
  const db = (payload.db as any)?.drizzle
  let totalBytes = 0
  let totalImages = 0

  try {
    if (db?.execute) {
      const res = await db.execute(
        'SELECT COUNT(*)::int AS count, COALESCE(SUM(filesize), 0)::bigint AS bytes FROM media',
      )
      if (res.rows && res.rows[0]) {
        totalImages = Number(res.rows[0].count || 0)
        totalBytes = Number(res.rows[0].bytes || 0)
      }
    } else {
      throw new Error('Direct DB not available')
    }
  } catch {
    const mediaRes = await payload.find({
      collection: 'media',
      limit: 500,
      pagination: false,
      overrideAccess: true,
    })
    totalImages = mediaRes.docs.length
    totalBytes = mediaRes.docs.reduce((acc: number, doc: any) => acc + (doc.filesize || 0), 0)
  }

  const limitMB = 1024 // 1 GB gratis en Supabase Storage
  const usedMB = Number((totalBytes / (1024 * 1024)).toFixed(1))
  const percentUsed = Number(((usedMB / limitMB) * 100).toFixed(1))
  const remainingMB = Number(Math.max(0, limitMB - usedMB).toFixed(1))
  const avgImageMB = totalImages > 0 ? usedMB / totalImages : 0.35
  const estimatedImagesRemaining = Math.max(0, Math.floor(remainingMB / (avgImageMB || 0.35)))

  // Consulta de las fotos más pesadas para que Shirley pueda analizar cuáles eliminar
  let topHeavyFiles: MediaStorageStats['topHeavyFiles'] = []
  try {
    const heavyRes = await payload.find({
      collection: 'media',
      limit: topCount,
      sort: '-filesize',
      overrideAccess: true,
    })

    topHeavyFiles = heavyRes.docs.map((doc: any) => ({
      id: doc.id,
      alt: doc.alt || doc.filename || 'Foto sin descripción',
      filename: doc.filename || '',
      filesize: doc.filesize || 0,
      filesizeFormatted: formatBytes(doc.filesize || 0),
      url: doc.url || '',
    }))
  } catch (err) {
    payload.logger.warn({ msg: '[storageAlerts] Error consultando fotos pesadas', err })
  }

  const status: 'healthy' | 'warning' | 'danger' =
    percentUsed >= 85 ? 'danger' : percentUsed >= 70 ? 'warning' : 'healthy'

  return {
    totalImages,
    totalBytes,
    usedMB,
    limitMB,
    limitGB: 1,
    percentUsed,
    remainingMB,
    estimatedImagesRemaining,
    status,
    topHeavyFiles,
  }
}

/**
 * Genera el reporte en texto amigable para Shirley por Telegram.
 */
export function formatStorageReport(stats: MediaStorageStats): string {
  const statusEmoji = stats.status === 'danger' ? '🚨' : stats.status === 'warning' ? '⚠️' : '✅'
  const statusNote =
    stats.status === 'danger'
      ? '¡Atención! Estás cerca del límite del plan gratuito de Supabase.'
      : stats.status === 'warning'
      ? 'Aviso: Estás utilizando más del 70% del almacenamiento.'
      : 'Excelente: Tu almacenamiento está en nivel óptimo y 100% gratuito.'

  const heavyList =
    stats.topHeavyFiles.length > 0
      ? stats.topHeavyFiles
          .map(
            (f, i) =>
              `   ${i + 1}. 📷 <b>${f.alt.slice(0, 45)}</b>\n      📁 Archivo: <code>${f.filename}</code> • ⚖️ ${f.filesizeFormatted}`,
          )
          .join('\n\n')
      : '   No hay archivos suficientes para listar.'

  return [
    `☁️ <b>Almacenamiento de Fotos Nénufar (Supabase $0/mes)</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `${statusEmoji} <b>Estado:</b> ${statusNote}`,
    `📊 <b>Uso:</b> ${stats.usedMB} MB de ${stats.limitMB} MB (${stats.percentUsed}% ocupado)`,
    `💾 <b>Espacio libre:</b> ${stats.remainingMB} MB (~${stats.estimatedImagesRemaining.toLocaleString()} fotos más)`,
    `🖼️ <b>Total de fotos:</b> ${stats.totalImages} imágenes`,
    ``,
    `🔍 <b>Fotos más pesadas (para analizar y liberar espacio si necesitas):</b>`,
    heavyList,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💡 <b>¿Cómo liberar espacio?</b>`,
    `• Puedes decirme: <i>"elimina la foto [título]"</i> para retirarla de la galería.`,
    `• O elimínala directamente desde el panel: /admin/collections/media`,
  ].join('\n')
}

/**
 * Hook proactivo que se llama tras subir una foto. Si supera el 85%, envía alerta a Telegram.
 */
export async function checkAndSendStorageAlert(
  payload: Payload,
  overrideCooldown = false,
): Promise<boolean> {
  try {
    const stats = await getMediaStorageStats(payload, 5)

    // Alertar desde el 70% para avisar con margen de maniobra
    if (stats.percentUsed < 70) {
      return false
    }

    const now = Date.now()
    const isStepIncrease = stats.percentUsed >= lastAlertPercent + 3 // Nueva alerta cada subida de 3%
    const isCooldownElapsed = now - lastAlertTimestamp > ALERT_COOLDOWN_MS

    if (!overrideCooldown && !isCooldownElapsed && !isStepIncrease) {
      return false
    }

    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID
    if (!chatId) {
      payload.logger.warn({ msg: '[storageAlerts] TELEGRAM_ADMIN_CHAT_ID no configurado' })
      return false
    }

    const isDanger = stats.percentUsed >= 85
    const alertMessage = [
      isDanger ? `🚨 <b>¡ALERTA DE ALMACENAMIENTO NÉNUFAR!</b> 🚨` : `⚠️ <b>AVISO DE ALMACENAMIENTO NÉNUFAR</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      isDanger
        ? `Shirley, el almacenamiento de fotos ha entrado en <b>ZONA ROJA</b>:`
        : `Shirley, el almacenamiento de fotos llegó al <b>${stats.percentUsed}%</b>, conviene ir liberando espacio:`,
      `🔴 Has alcanzado el <b>${stats.percentUsed}%</b> de tu plan gratuito de Supabase Storage.`,
      `📊 Usado: <b>${stats.usedMB} MB de ${stats.limitMB} MB (1 GB)</b>.`,
      `⚠️ Te quedan solo <b>${stats.remainingMB} MB libres</b> (aprox. ~${stats.estimatedImagesRemaining} fotos).`,
      ``,
      `🔍 <b>Fotos más pesadas que puedes analizar para eliminar:</b>`,
      ...stats.topHeavyFiles.map(
        (f, i) =>
          `   ${i + 1}. 📷 <b>${f.alt.slice(0, 40)}</b> (${f.filesizeFormatted})\n      Archivo: <code>${f.filename}</code>`,
      ),
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💡 <b>Acciones recomendadas:</b>`,
      `1. Di: <i>"elimina la foto [título]"</i> para borrar alguna que ya no uses.`,
      `2. Entra a tu panel web: /admin/collections/media para eliminar borradores o duplicados.`,
    ].join('\n')

    await sendTelegramReply({
      chatId,
      text: alertMessage,
      parseMode: 'HTML',
    })

    lastAlertTimestamp = now
    lastAlertPercent = stats.percentUsed
    payload.logger.info({
      msg: `[storageAlerts] Alerta de almacenamiento enviada a Telegram (${stats.percentUsed}%)`,
    })

    return true
  } catch (err) {
    payload.logger.error({ msg: '[storageAlerts] Error verificando o enviando alerta', err })
    return false
  }
}
