import React from 'react'

export const Logo = () => {
  return (
    /* eslint-disable @next/next/no-img-element */
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem 0',
      }}
    >
      <img
        alt="Nenúfar Logo"
        src="/nenufar-logo.svg"
        style={{
          height: '44px',
          width: 'auto',
          maxHeight: '44px',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

export const Icon = () => (
  /* eslint-disable @next/next/no-img-element */
  <img
    alt="Nenúfar Icon"
    src="/favicon.svg"
    style={{
      height: '28px',
      width: '28px',
      objectFit: 'contain',
    }}
  />
)
