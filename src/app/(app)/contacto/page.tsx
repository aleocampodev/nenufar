import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default function ContactoPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-serif mb-4 text-neutral-900">Contacto</h1>
          <p className="text-xl text-neutral-600 font-light">
            ¿Tenés alguna pregunta? Escribinos y Shirley te contacta.
          </p>
        </header>

        <div className="space-y-8">
          <section className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-2xl font-serif mb-4 text-neutral-900">Información de contacto</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Ubicación</h3>
                <p className="text-neutral-600">Cartagena, Colombia</p>
              </div>

              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Horario de atención</h3>
                <p className="text-neutral-600">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                <p className="text-neutral-600">Sábados: 9:00 AM - 1:00 PM</p>
              </div>

              <div>
                <h3 className="font-medium text-neutral-900 mb-1">Tiempo de respuesta</h3>
                <p className="text-neutral-600">Respondemos en menos de 24 horas hábiles</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-2xl font-serif mb-4 text-neutral-900">¿Cómo podemos ayudarte?</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💍</span>
                <div>
                  <h3 className="font-medium text-neutral-900">Consultas sobre productos</h3>
                  <p className="text-neutral-600 text-sm">Materiales, tamaños, personalización</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="font-medium text-neutral-900">Estado de tu pedido</h3>
                  <p className="text-neutral-600 text-sm">Seguimiento, cambios, devoluciones</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-medium text-neutral-900">Pedidos personalizados</h3>
                  <p className="text-neutral-600 text-sm">Diseños a medida, grabados especiales</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="font-medium text-neutral-900">Eventos y talleres</h3>
                  <p className="text-neutral-600 text-sm">Próximas ferias, workshops, lanzamientos</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#F8F5F2] rounded-lg border border-neutral-200 p-6">
            <h2 className="text-2xl font-serif mb-4 text-neutral-900">Realizar un pedido</h2>
            <p className="text-neutral-700 mb-4">
              Para realizar un pedido, navegá por nuestro catálogo y agregá las piezas que te gusten 
              al carrito. Cuando estés lista, confirmá tu pedido y Shirley te contacta para coordinar 
              pago y envío.
            </p>
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-[#6A1B9A] text-white font-medium rounded-md hover:bg-[#4A148C] transition"
            >
              Ver catálogo
            </a>
          </section>
        </div>
      </article>
    </main>
  )
}

export const metadata: Metadata = {
  description: 'Contactá a Nenúfar. Shirley te responde en menos de 24 horas.',
  openGraph: mergeOpenGraph({
    title: 'Contacto | Nenúfar',
    url: '/contacto',
  }),
  title: 'Contacto | Nenúfar',
}
