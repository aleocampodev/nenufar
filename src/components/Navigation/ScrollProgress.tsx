'use client'

import React, { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (totalHeight > 0) {
        setScrollPercentage((window.scrollY / totalHeight) * 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-brand via-purple-400 to-[#8B5A2B] transition-all duration-75 ease-out"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  )
}
