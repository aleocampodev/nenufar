import React from 'react'
import './index.scss'
import { MediaStorageQuota } from '@/components/Admin/MediaStorageQuota'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <>
      <MediaStorageQuota />
      <div className={`${baseClass} ${baseClass}__welcome`} style={{
        background: 'linear-gradient(135deg, rgba(233, 30, 140, 0.05) 0%, rgba(247, 244, 250, 0.9) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(233, 30, 140, 0.15)',
        padding: '24px 28px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px -2px rgba(233, 30, 140, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🌸</span>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#261a37', fontWeight: 600, fontFamily: 'serif' }}>
            ¡Bienvenida al Panel de Control de Nenúfar!
          </h3>
        </div>
        <p style={{ color: '#5f4d83', fontSize: '14px', margin: '0 0 18px 0', lineHeight: 1.5 }}>
          Desde aquí puedes administrar fácilmente tu catálogo de joyas, actualizar fotos, gestionar pedidos entrantes y organizar los talleres presenciales en Cartagena.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <a 
            href="/admin/collections/products" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(233, 30, 140, 0.12)', 
              color: '#261a37', 
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <span>💎</span>
            <div>
              <strong style={{ display: 'block', color: '#e91e8c' }}>Catálogo de Joyas</strong>
              <span style={{ fontSize: '11px', color: '#777' }}>Crear o editar piezas</span>
            </div>
          </a>

          <a 
            href="/admin/collections/orders" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(233, 30, 140, 0.12)', 
              color: '#261a37', 
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <span>📦</span>
            <div>
              <strong style={{ display: 'block', color: '#e91e8c' }}>Pedidos (Órdenes)</strong>
              <span style={{ fontSize: '11px', color: '#777' }}>Ver y despachar</span>
            </div>
          </a>

          <a 
            href="/admin/collections/media" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(233, 30, 140, 0.12)', 
              color: '#261a37', 
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <span>📸</span>
            <div>
              <strong style={{ display: 'block', color: '#e91e8c' }}>Medios y Archivos</strong>
              <span style={{ fontSize: '11px', color: '#777' }}>Subir fotos de joyas</span>
            </div>
          </a>

          <a 
            href="/admin/collections/pages/3" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(233, 30, 140, 0.12)', 
              color: '#261a37', 
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <span>✨</span>
            <div>
              <strong style={{ display: 'block', color: '#e91e8c' }}>Editar Landing</strong>
              <span style={{ fontSize: '11px', color: '#777' }}>Hero, fotos y carrusel</span>
            </div>
          </a>

          <a 
            href="/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 16px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(233, 30, 140, 0.12)', 
              color: '#261a37', 
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <span>🌐</span>
            <div>
              <strong style={{ display: 'block', color: '#e91e8c' }}>Ver Tienda en Vivo</strong>
              <span style={{ fontSize: '11px', color: '#777' }}>Abrir storefront web ↗</span>
            </div>
          </a>
        </div>
      </div>
    </>
  )
}
