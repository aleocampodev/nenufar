import React from 'react'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass} style={{
      background: 'linear-gradient(135deg, rgba(106, 27, 154, 0.05) 0%, rgba(247, 244, 250, 0.9) 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(106, 27, 154, 0.15)',
      padding: '24px 28px',
      marginBottom: '32px',
      boxShadow: '0 4px 20px -2px rgba(106, 27, 154, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>🌸</span>
        <h3 style={{ margin: 0, fontSize: '20px', color: '#261a37', fontWeight: 600, fontFamily: 'serif' }}>
          ¡Bienvenida al Panel de Control de Nénufar!
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
            border: '1px solid rgba(106, 27, 154, 0.12)', 
            color: '#261a37', 
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
        >
          <span>💎</span>
          <div>
            <strong style={{ display: 'block', color: '#6a1b9a' }}>Catálogo de Joyas</strong>
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
            border: '1px solid rgba(106, 27, 154, 0.12)', 
            color: '#261a37', 
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
        >
          <span>📦</span>
          <div>
            <strong style={{ display: 'block', color: '#6a1b9a' }}>Gestión de Pedidos</strong>
            <span style={{ fontSize: '11px', color: '#777' }}>Ver órdenes de compradoras</span>
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
            border: '1px solid rgba(106, 27, 154, 0.12)', 
            color: '#261a37', 
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
        >
          <span>🌐</span>
          <div>
            <strong style={{ display: 'block', color: '#6a1b9a' }}>Ver Tienda en Vivo</strong>
            <span style={{ fontSize: '11px', color: '#777' }}>Abrir storefront web ↗</span>
          </div>
        </a>
      </div>
    </div>
  )
}
