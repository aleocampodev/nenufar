'use client'

import React, { useEffect } from 'react'

export const AdminHydrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Strip third-party extension attributes (Grammarly, translation tools) from body and html
    if (typeof document !== 'undefined') {
      const cleanAttrs = () => {
        if (document.body) {
          document.body.removeAttribute('data-new-gr-c-s-check-loaded')
          document.body.removeAttribute('data-gr-ext-installed')
        }
      }
      cleanAttrs()
      const observer = new MutationObserver(cleanAttrs)
      if (document.body) {
        observer.observe(document.body, { attributes: true })
      }
      return () => observer.disconnect()
    }
  }, [])

  return <>{children}</>
}
