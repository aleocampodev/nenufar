'use client'

import React, { useEffect, useRef, useState } from 'react'

export type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up'
  | 'zoom-in'
  | 'fade'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: AnimationVariant
  delay?: number // ms
  duration?: number // ms
  threshold?: number
  rootMargin?: string
  once?: boolean
  distance?: number // px
  blur?: boolean
}

export function ScrollReveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  duration = 850,
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  once = true,
  distance = 36,
  blur = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respetar accesibilidad de usuario con prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.unobserve(el)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [once, threshold, rootMargin])

  const getTransformStyles = (): React.CSSProperties => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        filter: 'blur(0px)',
      }
    }

    switch (variant) {
      case 'fade-up':
        return {
          opacity: 0,
          transform: `translate3d(0, ${distance}px, 0) scale(0.985)`,
          filter: blur ? 'blur(6px)' : 'none',
        }
      case 'fade-down':
        return {
          opacity: 0,
          transform: `translate3d(0, -${distance}px, 0) scale(0.985)`,
          filter: blur ? 'blur(6px)' : 'none',
        }
      case 'fade-left':
        return {
          opacity: 0,
          transform: `translate3d(-${distance}px, 0, 0)`,
          filter: blur ? 'blur(6px)' : 'none',
        }
      case 'fade-right':
        return {
          opacity: 0,
          transform: `translate3d(${distance}px, 0, 0)`,
          filter: blur ? 'blur(6px)' : 'none',
        }
      case 'scale-up':
      case 'zoom-in':
        return {
          opacity: 0,
          transform: 'scale(0.93)',
          filter: blur ? 'blur(6px)' : 'none',
        }
      case 'fade':
      default:
        return {
          opacity: 0,
          transform: 'none',
          filter: blur ? 'blur(6px)' : 'none',
        }
    }
  }

  const animStyle = getTransformStyles()

  return (
    <div
      ref={ref}
      className={`w-full transition-all will-change-[transform,opacity,filter] ${className}`}
      style={{
        ...animStyle,
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  )
}
