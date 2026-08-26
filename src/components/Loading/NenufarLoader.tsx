import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

type Props = {
  fullScreen?: boolean
  className?: string
}

export function NenufarLoader({ fullScreen = false, className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none gap-6 ${
        fullScreen ? 'min-h-[70vh] w-full' : 'py-16 w-full'
      } ${className}`}
      role="status"
      aria-label="Cargando Nenúfar"
    >
      {/* Círculo concéntrico giratorio con Logo central (Desktop y Móvil) */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Halo de fondo con pulsación sutil */}
        <div className="absolute inset-0 rounded-full border border-brand/10 bg-brand/[0.02] backdrop-blur-sm" />

        {/* Pista circular base */}
        <div className="absolute inset-2 rounded-full border-2 border-brand/15" />

        {/* Arco orbital giratorio continuo y fluido */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-brand border-r-brand/60 rounded-full animate-spin [animation-duration:1.4s]" />

        {/* Segundo arco interior en contra-rotación sutil en morado de marca */}
        <div className="absolute inset-4 rounded-full border border-transparent border-b-brand/50 rounded-full animate-spin [animation-duration:2.8s] [animation-direction:reverse]" />

        {/* Isotipo central Nenúfar con latido */}
        <div className="relative z-10 animate-pulse [animation-duration:2s]">
          <LogoIcon className="w-12 h-12 text-brand drop-shadow-md" />
        </div>
      </div>

      {/* Tipografía de marca */}
      <div className="flex flex-col items-center">
        <span className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-brand font-medium animate-pulse">
          Nenúfar
        </span>
      </div>
    </div>
  )
}
