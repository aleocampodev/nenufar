import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default function PrivacidadPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <article className="prose prose-neutral max-w-none">
        <h1 className="text-4xl font-serif mb-6 text-neutral-900">Política de Privacidad</h1>

        <p className="text-neutral-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">1. Información que recopilamos</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            En Nenúfar, recopilamos la siguiente información cuando realizás un pedido:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
            <li>Nombre y apellido</li>
            <li>Datos de contacto (WhatsApp o email)</li>
            <li>Detalles del pedido (productos, cantidades, notas de personalización)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">2. Cómo usamos tu información</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Utilizamos tu información exclusivamente para:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
            <li>Procesar y gestionar tu pedido</li>
            <li>Contactarte para coordinar pago y envío</li>
            <li>Responder consultas sobre tu pedido</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">3. Protección de datos (Ley 1581 de 2012)</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            De conformidad con la Ley 1581 de 2012 de Colombia y el Decreto 1377 de 2013, 
            Nenúfar garantiza la protección de tus datos personales. Al realizar un pedido, 
            otorgás tu consentimiento explícito para el tratamiento de tus datos con los fines 
            descritos en esta política.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">4. Compartición de datos</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            <strong>No compartimos tu información con terceros</strong>, excepto:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
            <li>Servicios de envío (solo tu dirección y teléfono para entregas)</li>
            <li>Obligaciones legales cuando sea requerido por autoridad competente</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">5. Tus derechos</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            Tenés derecho a:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
            <li>Acceder a tus datos personales</li>
            <li>Corregir información inexacta</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Revocar tu consentimiento</li>
          </ul>
          <p className="text-neutral-700 leading-relaxed">
            Para ejercer estos derechos, contactanos a través de nuestra página de contacto.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">6. Seguridad</h2>
          <p className="text-neutral-700 leading-relaxed">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
            contra acceso no autorizado, alteración, divulgación o destrucción.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif mb-3 text-neutral-900">7. Contacto</h2>
          <p className="text-neutral-700 leading-relaxed">
            Si tenés preguntas sobre esta política de privacidad, contactanos a través de nuestra{' '}
            <a href="/contacto" className="text-[#6A1B9A] hover:underline">
              página de contacto
            </a>.
          </p>
        </section>
      </article>
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Política de privacidad de Nenúfar. Ley 1581 de 2012 de Colombia.',
  openGraph: mergeOpenGraph({
    title: 'Política de Privacidad | Nenúfar',
    url: '/privacidad',
  }),
  title: 'Política de Privacidad | Nenúfar',
}
