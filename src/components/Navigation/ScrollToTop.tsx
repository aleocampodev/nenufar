'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const currentScroll = window.scrollY

      if (totalHeight > 0) {
        setScrollProgress((currentScroll / totalHeight) * 100)
      }

      if (currentScroll > 320) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Volver arriba"
        title="Volver arriba"
        className="relative group w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_35px_rgba(106,27,154,0.25)] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:text-brand transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        {/* Anillo sutil de progreso de scroll */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5 pointer-events-none" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-neutral-200/50 dark:stroke-zinc-800"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-brand transition-all duration-150"
            strokeWidth="2.5"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Ícono de flecha con rebote suave en hover */}
        <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </div>
  )
}
