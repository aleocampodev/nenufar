import clsx from 'clsx'
import React from 'react'

export interface LogoIconProps extends React.ComponentProps<'img'> {
  variant?: 'color' | 'blanco'
}

export function LogoIcon({ variant = 'color', className, src, ...props }: LogoIconProps) {
  const logoSrc = src || (variant === 'blanco' ? '/nenufar-blanco.svg' : '/nenufar-logo.svg')

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Nenúfar Logo"
      src={logoSrc}
      {...props}
      className={clsx('h-9 w-auto object-contain', className)}
    />
  )
}

