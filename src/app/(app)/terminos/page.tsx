import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

const LAST_UPDATED = '1 de agosto de 2026'

export const metadata: Metadata = {
  description: 'Términos y condiciones de compra en Nénufar. Joyería artesanal colombiana.',
  openGraph: mergeOpenGraph({
    title: 'Términos y Condiciones | Nénufar',
    url: '/terminos',
  }),
  title: 'Términos y Condiciones | Nénufar',
}

export default function TerminosPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <article className="prose prose-neutral max-w-none">
        <h1 className="text-4xl font-serif mb-6 text-neutral-900">Términos y Condiciones</h1>

        <p className="text-neutral-600 mb-8">Última actualización: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">1. Aceptación</h2>
          <p className="text-neutral-700 leading-relaxed">
            Al realizar un pedido en Nénufar aceptás estos términos y condiciones. Si no estás de
            acuerdo con alguno de ellos, por favor no realices tu pedido y contactanos para resolver
            cualquier duda.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">2. Productos artesanales</h2>
          <p className="text-neutral-700 leading-relaxed">
            Todas las piezas de Nénufar son elaboradas a mano por Shirley en su taller en Cartagena,
            Colombia. Dado su carácter artesanal, pueden existir pequeñas variaciones en color,
            textura y acabado entre piezas, lo cual forma parte de su autenticidad y valor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">3. Proceso de compra</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Al confirmar tu pedido, Shirley se pondrá en contacto para coordinar:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2">
            <li>La forma de pago (transferencia bancaria, Nequi u otro método acordado)</li>
            <li>El método y costo de envío según tu ubicación</li>
            <li>El tiempo de elaboración si el producto requiere fabricación especial</li>
          </ul>
          <p className="text-neutral-700 leading-relaxed mt-4">
            El pedido se considera confirmado únicamente cuando ambas partes acuerdan los detalles y
            se recibe el pago.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">4. Precios y moneda</h2>
          <p className="text-neutral-700 leading-relaxed">
            Todos los precios están expresados en Pesos Colombianos (COP) y pueden variar sin previo
            aviso. El precio válido es el vigente al momento de la confirmación del pedido por parte
            de Shirley.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">5. Envíos</h2>
          <p className="text-neutral-700 leading-relaxed">
            Realizamos envíos a todo Colombia. El costo y tiempo de envío varían según la empresa de
            mensajería y la ubicación de destino. Nénufar no se hace responsable por demoras
            ocasionadas por la empresa de mensajería una vez el paquete ha sido entregado a la
            transportadora.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">6. Cambios y devoluciones</h2>
          <p className="text-neutral-700 leading-relaxed">
            Dado el carácter artesanal y personalizado de las piezas, no realizamos devoluciones
            salvo en caso de defecto de fabricación. Para cambios de talla u otras modificaciones,
            contactanos dentro de los 15 días siguientes a la recepción del producto.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">7. Propiedad intelectual</h2>
          <p className="text-neutral-700 leading-relaxed">
            Todos los diseños, fotografías y contenidos de Nénufar son propiedad de Shirley y están
            protegidos por las leyes colombianas de derechos de autor. Queda prohibida su
            reproducción sin autorización expresa.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">8. Contacto</h2>
          <p className="text-neutral-700 leading-relaxed">
            Para cualquier consulta sobre estos términos, contáctanos a través de nuestra{' '}
            <a href="/contacto" className="text-brand hover:underline">
              página de contacto
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  )
}
