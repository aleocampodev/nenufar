import React from 'react'

export const Logo = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" fill="#6A1B9A" />
        <text
          x="50%"
          y="54%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >
          N
        </text>
      </svg>
      <span
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#6A1B9A',
          fontFamily: 'Georgia, serif',
          letterSpacing: '-0.01em',
        }}
      >
        Nénufar
      </span>
    </div>
  )
}
