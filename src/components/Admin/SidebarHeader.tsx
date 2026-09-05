import React from 'react'

export const SidebarHeader: React.FC = () => {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="sidebar-header-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '1.25rem 1rem 1rem 1rem',
        margin: '0 0 0.75rem 0',
        borderBottom: '1px solid var(--color-base-150)',
        textDecoration: 'none',
        cursor: 'pointer',
        background: 'transparent',
        backgroundColor: 'transparent',
        borderRadius: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Nenúfar Logo"
        src="/nenufar-logo.png"
        style={{
          height: '42px',
          width: 'auto',
          maxHeight: '42px',
          objectFit: 'contain',
        }}
      />
      <span
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '1.55rem',
          fontWeight: 900,
          color: '#E91E8C',
          letterSpacing: '-0.02em',
        }}
      >
        Nenúfar
      </span>
    </a>
  )
}
