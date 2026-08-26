'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'

type Props = {
  header: Header
  categories?: { id: number | string; title: string; slug: string }[]
}

export function HeaderClient({ header }: Props) {
  return (
    <header className="relative z-30 bg-white">
      <nav className="flex items-center justify-between max-w-[1300px] mx-auto px-6 lg:px-8 h-[72px]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoIcon className="w-7 h-7 text-brand transition-transform duration-300 group-hover:scale-105" />
          <span className="font-serif text-2xl tracking-wide text-foreground group-hover:text-brand transition-colors">
            Nenúfar
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex">
            <Suspense fallback={null}>
              <MobileMenu menu={header.navItems} />
            </Suspense>
          </div>
          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
