import React from 'react'

export const Logo = () => {
  return (
    /* eslint-disable @next/next/no-img-element */
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.25rem 0',
      }}
    >
      <img
        alt="Nénufar Logo"
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
          fontSize: '1.45rem',
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

export const Icon = () => {
  return (
    /* eslint-disable @next/next/no-img-element */
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25rem',
      }}
    >
      <img
        alt="Nénufar Icon"
        src="/nenufar-icon.png"
        style={{
          height: '32px',
          width: '32px',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
