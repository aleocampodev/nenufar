import React from 'react'

export const Logo = () => {
  return (
    /* eslint-disable @next/next/no-img-element */
    <div className="flex items-center gap-3 py-1">
      <img
        alt="Nenúfar Logo"
        className="h-10 w-auto object-contain max-h-10"
        src="/nenufar-logo.png"
      />
      <span className="font-serif text-xl font-bold tracking-tight text-[#6A1B9A]">
        Nenúfar
      </span>
    </div>
  )
}

