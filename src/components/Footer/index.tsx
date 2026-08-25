import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

/**
 * Retorna el rango o año actual dinámicamente.
 * Actualiza automáticamente al año vigente en producción.
 */
export function getCurrentCopyrightYear(startYear: number = 2024): string {
  const currentYear = new Date().getFullYear()
  return currentYear > startYear ? `${startYear}–${currentYear}` : `${currentYear}`
}

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  // Storefront = landing + ecommerce: se mantienen solo shop y legales.
  const ALLOWED_FOOTER_URLS = ['/shop', '/privacidad', '/terminos', '/pedidos']
  const menu = (footer.navItems || []).filter((item) => {
    const url = item.link?.url
    return !url || ALLOWED_FOOTER_URLS.some((allowed) => url.startsWith(allowed))
  })
  
  const copyrightDate = getCurrentCopyrightYear(2024)
  const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700'
  const copyrightName = COMPANY_NAME || SITE_NAME || 'Nenúfar'

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container">
        <div className="flex flex-col gap-8 py-16 md:flex-row md:gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 md:w-1/3">
            <Link className="flex items-center gap-3 hover:opacity-80 transition-opacity" href="/">
              <LogoIcon className="w-8 h-8 text-brand" />
              <span className="font-serif text-2xl text-foreground">Nenúfar</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Joyería y accesorios artesanales en mostacilla hechos a mano en Cartagena, Colombia.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex-1">
            <Suspense fallback={
              <div className="flex h-[120px] w-[200px] flex-col gap-2">
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
              </div>
            }>
              <FooterMenu menu={menu} />
            </Suspense>
          </div>

          {/* Slogan Artesanal */}
          <div className="flex flex-col gap-2 items-start md:items-end justify-center">
            <span className="text-xs uppercase tracking-[0.25em] text-brand font-serif font-semibold">
              Artesanías en Mostacilla
            </span>
            <span className="text-[11px] text-muted-foreground font-light">
              Cartagena de Indias
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border py-6 bg-background">
        <div className="container flex flex-col items-center gap-4 md:flex-row md:gap-0">
          <p className="text-sm text-muted-foreground">
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''}
          </p>

          <div className="hidden md:block mx-auto h-px w-16 bg-border/50" />

          <p className="text-sm text-muted-foreground">
            Hecho con <span className="text-brand font-bold">❤</span> en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
