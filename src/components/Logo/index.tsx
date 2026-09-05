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
        alt="Nenúfar Logo"
        src="/nenufar-negro.svg"
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
          color: '#E91E8C',
          letterSpacing: '-0.01em',
        }}
      >
        Nenúfar
      </span>
    </div>
  )
}

export const Icon = () => (
  /* eslint-disable @next/next/no-img-element */
  <img
    alt="Nenúfar Icon"
    src="/nenufar-negro.svg"
    style={{
      height: '28px',
      width: '28px',
      objectFit: 'contain',
    }}
  />
)
