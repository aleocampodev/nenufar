import React from 'react'

export const SidebarHeader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.25rem 1rem 1rem 1rem',
        marginBottom: '0.5rem',
        borderBottom: '1px solid var(--color-base-150)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Nénufar Logo"
        src="/nenufar-logo.png"
        style={{
          height: '40px',
          width: 'auto',
          maxHeight: '40px',
          objectFit: 'contain',
        }}
      />
      <span
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#6A1B9A',
          letterSpacing: '-0.01em',
        }}
      >
        Nénufar
      </span>
    </div>
  )
}
