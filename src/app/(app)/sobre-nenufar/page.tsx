import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default function SobreNenufarPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-serif mb-4 text-neutral-900">Sobre Nenúfar</h1>
          <p className="text-xl text-neutral-600 font-light">
            Joyería artesanal hecha a mano en Cartagena, Colombia
          </p>
        </header>

        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-serif mb-3 text-neutral-900">Nuestra historia</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nenúfar nació de la pasión por crear piezas únicas que cuentan historias. Cada joya es
              elaborada a mano por Shirley en su taller en Cartagena, combinando técnicas artesanales
              con diseños contemporáneos que celebran la belleza natural.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-3 text-neutral-900">Filosofía</h2>
            <p className="text-neutral-700 leading-relaxed">
              Creemos en la joyería lenta y consciente. Cada pieza toma tiempo, dedicación y amor.
              No producimos en masa — cada anillo, collar y pulsera es único, como la persona que lo
              lleva.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-3 text-neutral-900">Materiales</h2>
            <p className="text-neutral-700 leading-relaxed">
              Trabajamos con materiales de alta calidad: plata 925, oro de 14k y 18k, piedras
              naturales y perlas cultivadas. Cada material es seleccionado cuidadosamente para
              garantizar durabilidad y belleza.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-3 text-neutral-900">Shirley</h2>
            <p className="text-neutral-700 leading-relaxed">
              Shirley es la artesana detrás de Nenúfar. Con más de 10 años de experiencia en
              joyería, ha desarrollado un estilo único que fusiona lo tradicional con lo moderno.
              Cada pieza que crea lleva su sello personal y su compromiso con la excelencia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-3 text-neutral-900">Contacto</h2>
            <p className="text-neutral-700 leading-relaxed">
              ¿Tenés alguna pregunta o querés una pieza personalizada? Escribinos y Shirley te
              contacta directamente.
            </p>
            <a
              href="/#contacto"
              className="inline-block mt-4 px-6 py-3 bg-brand text-brand-foreground rounded-md hover:bg-brand-dark transition"
            >
              Contactar a Shirley
            </a>
          </section>
        </div>
      </article>
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Conocé la historia de Nenúfar y Shirley, joyería artesanal hecha a mano en Cartagena.',
  openGraph: mergeOpenGraph({
    title: 'Sobre Nenúfar | Joyería Artesanal',
    url: '/sobre-nenufar',
  }),
  title: 'Sobre Nenúfar | Joyería Artesanal',
}
