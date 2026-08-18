import React from 'react'

export const BeforeLogin: React.FC = () => {
  return (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#6A1B9A',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Nénufar Admin
      </h2>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
        Panel de administración exclusivo para Shirley.
        <br />
        <span style={{ fontSize: '0.85rem' }}>
          ¿Eres comprador?{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/login`}
            style={{ color: '#6A1B9A', textDecoration: 'underline' }}
          >
            Accede a tu cuenta aquí
          </a>
        </span>
      </p>
    </div>
  )
}
