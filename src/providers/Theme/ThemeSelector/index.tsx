'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { useTheme } from '..'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-[62px] h-[32px] rounded-full bg-muted/40 animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-[62px] h-[32px] rounded-full p-[3px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer select-none shadow-inner ${
        isDark ? 'bg-slate-700/90' : 'bg-slate-200/90'
      }`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {/* Iconos de Fondo en la pista */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'text-slate-400 opacity-40' : 'opacity-0'}`} />
        <Moon className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'text-slate-400 opacity-40'}`} />
      </div>

      {/* Botón Circular Deslizante (Knob) */}
      <div
        className={`relative z-10 w-[26px] h-[26px] rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center transform transition-transform duration-300 ease-spring ${
          isDark ? 'translate-x-[30px]' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <div className="flex items-center justify-center text-indigo-400">
            <Moon className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          </div>
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        )}
      </div>
    </button>
  )
}
