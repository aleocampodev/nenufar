import clsx from 'clsx'
import React from 'react'

export interface LogoIconProps extends React.ComponentProps<'img'> {
  variant?: 'blanco' | 'negro'
}

export function LogoIcon({ variant = 'blanco', className, src, ...props }: LogoIconProps) {
  const logoSrc = src || (variant === 'negro' ? '/nenufar-negro.svg' : '/nenufar-blanco.svg')

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Nenúfar Logo"
      src={logoSrc}
      {...props}
      className={clsx('h-8 w-8 object-contain', className)}
    />
  )
}

