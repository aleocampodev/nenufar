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
    <footer className="bg-[#3D1A5B] text-white border-t border-[#4D2472]/60 mt-auto">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-16 lg:py-20">
          {/* Columna 1: Marca & Filosofía */}
          <div className="space-y-4">
            <Link className="flex items-center gap-3 group" href="/">
              <LogoIcon className="w-8 h-8 text-white transition-transform group-hover:scale-105" />
              <span className="font-serif text-2xl tracking-wide text-white font-medium group-hover:text-[#FF4FA3] transition-colors">Nenúfar</span>
            </Link>
            <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed font-light">
              Joyería de autor tejida a mano con mostacilla calibrada y filigrana en Cartagena de Indias. Piezas con alma caribeña hechas para perdurar.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#E91E8C]/20 text-[#FF4FA3] text-[10px] uppercase tracking-[0.25em] font-medium border border-[#FF4FA3]/30">
                100% Hecho a Mano
              </span>
            </div>
          </div>

          {/* Columna 2: Colecciones */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white font-medium tracking-wider uppercase">
              Colecciones
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-purple-100/80 font-light">
              <li>
                <Link href="/shop?category=collares" className="hover:text-[#FF4FA3] transition-colors">
                  Collares & Gargantillas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pulseras" className="hover:text-[#FF4FA3] transition-colors">
                  Pulseras & Manillas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=aretes" className="hover:text-[#FF4FA3] transition-colors">
                  Aretes & Candongas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ancestrales" className="hover:text-[#FF4FA3] transition-colors">
                  Ancestrales
                </Link>
              </li>
              <li>
                <Link href="/shop?category=colibries" className="hover:text-[#FF4FA3] transition-colors">
                  Colibríes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ediciones-especiales" className="hover:text-[#FF4FA3] transition-colors">
                  Ediciones Especiales
                </Link>
              </li>
              <li>
                <Link href="/#talleres" className="hover:text-[#FF4FA3] transition-colors">
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
            <ul className="space-y-2.5 text-xs sm:text-sm text-purple-100/80 font-light">
              <li>
                <Link href="/#contacto" className="hover:text-[#FF4FA3] transition-colors">
                  Pedidos Personalizados
                </Link>
              </li>
              <li>
                <Link href="/find-order" className="hover:text-[#FF4FA3] transition-colors">
                  Consultar Pedido
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-[#FF4FA3] transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-[#FF4FA3] transition-colors">
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
            <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed font-light">
              Cartagena de Indias, Colombia.<br />
              Atención personalizada vía Telegram y WhatsApp para asesorarte en tus piezas únicas.
            </p>
            <div className="pt-1">
              <Link
                href="/#contacto"
                className="inline-block text-xs uppercase tracking-widest font-medium text-[#FF4FA3] hover:text-white underline underline-offset-4 decoration-[#FF4FA3]/50 transition-colors"
              >
                Escribir a Shirley →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior en Neutro Oscuro #1A0E2E */}
      <div className="border-t border-[#4D2472]/40 py-6 bg-[#1A0E2E]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-light">
          <p>
            &copy; {copyrightDate} {copyrightName}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Hecho con dedicación en</span>
            <span className="text-neutral-200 font-normal">Cartagena de Indias, Colombia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
