import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

type Props = {
  fullScreen?: boolean
}

export function NenufarLoader({ fullScreen = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none gap-4 ${
        fullScreen ? 'min-h-[70vh] w-full' : 'py-20 w-full'
      }`}
      role="status"
      aria-label="Cargando Nenúfar"
    >
      {/* Ícono elaborado - solo en móvil */}
      <div className="relative flex items-center justify-center w-24 h-24 md:hidden">
        <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-ping opacity-60" />
        <div className="absolute inset-2 rounded-full border border-brand/30 animate-spin [animation-duration:3s] border-dashed" />
        <div className="absolute inset-4 rounded-full bg-brand/5 backdrop-blur-sm" />
        <div className="relative z-10 animate-pulse [animation-duration:2s]">
          <LogoIcon className="w-10 h-10 text-brand drop-shadow-md" />
        </div>
        <div className="absolute -top-1 w-2 h-2 rounded-full bg-brand shadow-sm animate-bounce [animation-delay:0.1s]" />
        <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-brand-light shadow-sm animate-bounce [animation-delay:0.3s]" />
      </div>
      {/* Texto Nenúfar llamativo - en todos */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-brand font-bold animate-pulse">
          Nenúfar
        </span>
        <span className="text-xs tracking-[0.3em] uppercase text-brand/70 font-medium">
          Joyería Artesanal
        </span>
        <div className="mt-2 flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand/70 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
