'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  variant?: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-right'
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.15,
  variant = 'fade-up',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  const getVariantStyles = () => {
    switch (variant) {
      case 'fade-in':
        return isVisible ? 'opacity-100' : 'opacity-0'
      case 'scale-up':
        return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      case 'slide-right':
        return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      case 'fade-up':
      default:
        return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }
  }

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  )
}
