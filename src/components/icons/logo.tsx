import clsx from 'clsx'
import React from 'react'

export function LogoIcon(props: React.ComponentProps<'img'>) {
  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Nenúfar Logo"
      src="/nenufar-logo.png"
      {...props}
      className={clsx('h-8 w-8 object-contain', props.className)}
    />
  )
}

