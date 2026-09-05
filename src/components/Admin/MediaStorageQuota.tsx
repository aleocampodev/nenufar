'use client'

import React, { useEffect, useState } from 'react'

type QuotaStats = {
  totalImages: number
  usedMB: number
  limitMB: number
  limitGB: number
  percentUsed: number
  remainingMB: number
  estimatedImagesRemaining: number
  status: 'healthy' | 'warning' | 'danger'
}

export const MediaStorageQuota: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [stats, setStats] = useState<QuotaStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/media-quota')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid rgba(106, 27, 154, 0.15)',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#666',
      }}>
        Calculando almacenamiento gratuito...
      </div>
    )
  }

  if (!stats) return null

  const barColor = stats.status === 'danger' ? '#dc2626' : stats.status === 'warning' ? '#f59e0b' : '#e91e8c'
  const badgeBg = stats.status === 'danger' ? '#fee2e2' : stats.status === 'warning' ? '#fef3c7' : '#fce4f1'
  const badgeText = stats.status === 'danger' ? '#991b1b' : stats.status === 'warning' ? '#92400e' : '#e91e8c'

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid rgba(106, 27, 154, 0.18)',
      padding: compact ? '16px 20px' : '20px 24px',
      marginBottom: '24px',
      boxShadow: '0 4px 18px -4px rgba(106, 27, 154, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>☁️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1f1a2e' }}>
              Almacenamiento de Fotos (Plan Gratuito $0/mes)
            </h4>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {stats.totalImages} imágenes subidas • {stats.usedMB} MB de {stats.limitMB} MB ({stats.limitGB} GB)
            </span>
          </div>
        </div>

        <span style={{
          backgroundColor: badgeBg,
          color: badgeText,
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: barColor }} />
          {stats.percentUsed}% Usado • 100% Gratuito
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.max(stats.percentUsed, 1.5)}%`,
          height: '100%',
          backgroundColor: barColor,
          borderRadius: '9999px',
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#4b5563', flexWrap: 'wrap', gap: '8px' }}>
        <span>
          Te quedan <strong>{stats.remainingMB} MB libres</strong> (espacio estimado para ~<strong>{stats.estimatedImagesRemaining.toLocaleString()}</strong> fotos más).
        </span>
        <span style={{ color: '#059669', fontWeight: 500 }}>
          ✓ Optimización automática a WebP activa
        </span>
      </div>
    </div>
  )
}
