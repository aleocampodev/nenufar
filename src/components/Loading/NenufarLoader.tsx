import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

type Props = {
  message?: string
  fullScreen?: boolean
}

export function NenufarLoader({
  message = 'Cargando joyas artesanales...',
  fullScreen = false,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 select-none ${
        fullScreen ? 'min-h-[70vh] w-full' : 'py-20 w-full'
      }`}
      role="status"
      aria-label={message}
    >
      {/* Contenedor del Ícono con Ondas de Mostacilla */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Anillo de ondas concéntricas de mostacilla */}
        <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-ping opacity-75" />
        <div className="absolute inset-2 rounded-full border border-brand/30 animate-spin [animation-duration:8s] border-dashed" />
        <div className="absolute inset-4 rounded-full bg-brand/5 dark:bg-brand/15 backdrop-blur-sm" />

        {/* Flor de Nenúfar pulsante en Morado de Marca */}
        <div className="relative z-10 animate-pulse [animation-duration:2s]">
          <LogoIcon className="w-10 h-10 text-brand drop-shadow-md" />
        </div>

        {/* Cuentas de mostacilla giratorias */}
        <div className="absolute -top-1 w-2 h-2 rounded-full bg-brand shadow-sm animate-bounce [animation-delay:0.1s]" />
        <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-brand-light shadow-sm animate-bounce [animation-delay:0.3s]" />
      </div>

      {/* Título de Marca y Mensaje */}
      <span className="font-serif text-lg tracking-wider text-foreground font-semibold mb-1">
        Nenúfar
      </span>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-sans animate-pulse">
        {message}
      </p>
    </div>
  )
}
