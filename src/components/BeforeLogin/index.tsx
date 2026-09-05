'use client'

import React, { useEffect } from 'react'

export const BeforeLogin: React.FC = () => {
  useEffect(() => {
    // Agrega el ojito al campo de contraseña del login de Payload
    const addEyeToggle = () => {
      const passwordInput = document.querySelector<HTMLInputElement>('input[type="password"]')
      if (!passwordInput || document.getElementById('nenufar-eye-btn')) return

      const wrapper = passwordInput.parentElement
      if (!wrapper) return

      Object.assign(wrapper.style, { position: 'relative', display: 'block' })

      const btn = document.createElement('button')
      btn.id = 'nenufar-eye-btn'
      btn.type = 'button'
      btn.setAttribute('aria-label', 'Mostrar u ocultar contraseña')
      Object.assign(btn.style, {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
      })

      const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`
      const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`

      btn.innerHTML = eyeOpen
      let visible = false

      btn.addEventListener('click', () => {
        visible = !visible
        passwordInput.type = visible ? 'text' : 'password'
        btn.innerHTML = visible ? eyeClosed : eyeOpen
      })

      wrapper.appendChild(btn)
    }

    // Intenta inmediatamente y luego observa si el input aparece después
    addEyeToggle()
    const observer = new MutationObserver(addEyeToggle)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#E91E8C',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Nenúfar Admin
      </h2>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
        Panel de administración exclusivo para Shirley.
        <br />
        <span style={{ fontSize: '0.85rem' }}>
          ¿Eres comprador?{' '}
          <a
            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/login`}
            style={{ color: '#E91E8C', textDecoration: 'underline' }}
          >
            Accede a tu cuenta aquí
          </a>
        </span>
      </p>
    </div>
  )
}
