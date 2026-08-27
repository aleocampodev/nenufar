'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function HashScrollHandler() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Delay slightly for React hydration and layout mounting
      const timer = setTimeout(() => {
        const target = document.querySelector(hash)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  return null
}
