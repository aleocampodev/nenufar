'use client'

import React, { useEffect, useState } from 'react'
import { NenufarLoader } from './NenufarLoader'

export function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Show splash loader on initial entrance, then fade out smoothly
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 600)

    const removeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 1200)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex items-center justify-center transition-opacity duration-600 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <NenufarLoader fullScreen />
    </div>
  )
}
