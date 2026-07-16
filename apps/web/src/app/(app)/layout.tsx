import type { Metadata } from 'next'
import { Alegreya, Lato } from 'next/font/google'
import '../globals.css'

const alegreya = Alegreya({
  variable: '--font-alegreya',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
})

export const metadata: Metadata = {
  title: 'Nénufar — Joyería hecha a mano',
  description:
    'Joyería artesanal de Cartagena, Colombia. Diseñada y elaborada a mano por Shirley.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${alegreya.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}