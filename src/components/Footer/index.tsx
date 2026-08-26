import type { Footer } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

export function getCurrentCopyrightYear(): string {
  return new Date().getFullYear().toString()
}

export async function Footer() {
  const copyrightDate = getCurrentCopyrightYear()
  const copyrightName = COMPANY_NAME || SITE_NAME || 'Nenúfar'

  return (
    <footer className="bg-[#181615] text-white border-t border-neutral-800/80 mt-auto">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-16 lg:py-20">
          {/* Columna 1: Marca & Filosofía */}
          <div className="space-y-4">
            <Link className="flex items-center gap-3 group" href="/">
              <LogoIcon className="w-8 h-8 text-brand transition-transform group-hover:scale-105" />
              <span className="font-serif text-2xl tracking-wide text-white font-medium">Nenúfar</span>
            </Link>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
              Joyería de autor tejida a mano con mostacilla calibrada y filigrana en Cartagena de Indias. Piezas con alma caribeña hechas para perdurar.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-neutral-800/80 text-[10px] uppercase tracking-[0.25em] text-purple-200/90 font-medium border border-neutral-700/60">
                100% Hecho a Mano
              </span>
            </div>
          </div>

          {/* Columna 2: Colecciones */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-medium tracking-wider uppercase">
              Colecciones
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
              <li>
                <Link href="/shop?category=collares" className="hover:text-white transition-colors">
                  Collares & Gargantillas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pulseras" className="hover:text-white transition-colors">
                  Pulseras & Manillas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=aretes" className="hover:text-white transition-colors">
                  Aretes & Candongas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ancestrales" className="hover:text-white transition-colors">
                  Ancestrales
                </Link>
              </li>
              <li>
                <Link href="/shop?category=colibries" className="hover:text-white transition-colors">
                  Colibríes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ediciones-especiales" className="hover:text-white transition-colors">
                  Ediciones Especiales
                </Link>
              </li>
              <li>
                <Link href="/#talleres" className="hover:text-white transition-colors">
                  Talleres & Ferias
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información & Ayuda */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-medium tracking-wider uppercase">
              Información
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
              <li>
                <Link href="/#contacto" className="hover:text-white transition-colors">
                  Pedidos Personalizados
                </Link>
              </li>
              <li>
                <Link href="/find-order" className="hover:text-white transition-colors">
                  Consultar Pedido
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">
                  Términos & Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Taller en Cartagena */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-medium tracking-wider uppercase">
              Taller Shirley
            </h4>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
              Cartagena de Indias, Colombia.<br />
              Atención personalizada vía Telegram y WhatsApp para asesorarte en tus piezas únicas.
            </p>
            <div className="pt-1">
              <Link
                href="/#contacto"
                className="inline-block text-xs uppercase tracking-widest font-medium text-purple-300 hover:text-white underline underline-offset-4 decoration-purple-300/50 transition-colors"
              >
                Escribir a Shirley →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="border-t border-neutral-800/60 py-6 bg-[#131110]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-light">
          <p>
            &copy; {copyrightDate} {copyrightName}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Hecho con dedicación en</span>
            <span className="text-neutral-300 font-normal">Cartagena de Indias, Colombia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
