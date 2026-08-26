import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

type Props = {
  message?: string
  fullScreen?: boolean
}

export function NenufarLoader({ fullScreen = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        fullScreen ? 'min-h-[70vh] w-full' : 'py-20 w-full'
      }`}
      role="status"
      aria-label="Cargando"
    >
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border border-brand/20 animate-ping opacity-60" />
        <LogoIcon className="w-7 h-7 text-brand" />
      </div>
    </div>
  )
}
