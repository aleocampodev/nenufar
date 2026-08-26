'use client'

import React, { useEffect, useState } from 'react'
import { NenufarLoader } from './NenufarLoader'
import { cn } from '@/utilities/cn'

export function LandingLoader({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Small graceful delay to reveal the artisanal lotus loader smoothly
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 650)

    const removeTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1150)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <>
      {showSplash && (
        <div
          className={cn(
            'fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center transition-all duration-500 ease-out',
            fading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100',
          )}
          aria-hidden={!showSplash}
        >
          <NenufarLoader fullScreen />
        </div>
      )}
      <div
        className={cn(
          'transition-all duration-700 ease-out',
          !mounted || (showSplash && !fading) ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        )}
      >
        {children}
      </div>
    </>
  )
}
