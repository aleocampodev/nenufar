'use client'

import React from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}

export function ScrollReveal({
  children,
  className = '',
}: ScrollRevealProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
}
