'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { handleSearch } from '../actions/search'
import { createHandoffSession, getHandoffSession } from '../actions/handoff'
import { simulateCheckout } from '../actions/chat'
import { ProductCard } from '@/components/chat/ProductCard'
import { UpsellCard } from '@/components/chat/UpsellCard'
import { CheckoutCard } from '@/components/chat/CheckoutCard'
import { ConfirmationCard } from '@/components/chat/ConfirmationCard'

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}

function HomePageContent() {
  // ── Left panel states ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [addEngraving, setAddEngraving] = useState(false)
  const [engravingText, setEngravingText] = useState('')
  const [isGeneratingHandoff, setIsGeneratingHandoff] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ── Right panel states ─────────────────────────────────────────
  const [sessionCode, setSessionCode] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── useChat (AI SDK v6) ────────────────────────────────────────
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({ sessionCode }),
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: '¡Hola! Soy Shirley, tu asistente de compras en Agento. 🇨🇴🛍️\n\nPor favor, escribe o pega tu código de compra (ejemplo: `AX-H3B9`) para rehidratar tu carrito y guiarte con el pago.',
          },
        ],
      },
    ] as UIMessage[],
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // ── Left panel logic ───────────────────────────────────────────
  const performSearch = async (query: string) => {
    setIsSearching(true)
    setErrorMsg(null)
    try {
      const results = await handleSearch(query)
      setSearchResults(results)
      if (results.length > 0) setSelectedProduct(results[0].product)
    } catch {
      setErrorMsg('Error al buscar productos. Inténtalo de nuevo.')
    } finally {
      setIsSearching(false)
    }
  }

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial search
  useEffect(() => {
    performSearch('artesanías tradicionales')
  }, [])

  // ── FEAT-12: Pick-up URL (?session=AX-XXXX) ────────────────────
  const searchParams = useSearchParams()
  const pickupCode = searchParams.get('session')

  const handlePickupSession = useCallback(async (code: string) => {
    if (!code) return
    const match = code.toUpperCase().match(/^AX-[A-Z2-9]{4}$/)
    if (!match) return

    setSessionCode(code)
    setGeneratedCode(code)
    setErrorMsg(null)

    // Load the session and pre-select the product on the left panel
    try {
      const res = await getHandoffSession(code)
      if (res.success && res.session) {
        const cart = res.session.cartContext as any
        if (cart?.product) {
          setSelectedProduct(cart.product)
          if (cart.product.engraving) {
            setAddEngraving(true)
            setEngravingText(cart.product.engraving)
          }
        }
      }
    } catch (e) {
      console.error('[Pickup URL] Error loading session:', e)
    }

    // Auto-send the code to the chat after a short delay
    setTimeout(() => {
      sendMessage({ text: code })
    }, 500)
  }, [sendMessage])

  useEffect(() => {
    if (pickupCode) {
      handlePickupSession(pickupCode)
    }
  }, [pickupCode, handlePickupSession])

  const handleHandoff = async () => {
    if (!selectedProduct) return
    setIsGeneratingHandoff(true)
    setErrorMsg(null)
    try {
      const res = await createHandoffSession({
        productId: Number(selectedProduct.id),
        engraving: addEngraving ? engravingText : undefined,
      })
      if (res.success && res.code) {
        setGeneratedCode(res.code)
      } else {
        setErrorMsg(res.error || 'Error al generar la sesión de handoff.')
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado.')
    } finally {
      setIsGeneratingHandoff(false)
    }
  }

  // ── Right panel logic ──────────────────────────────────────────
  const sendToChat = (text: string) => {
    const match = text.toUpperCase().match(/AX-[A-Z2-9]{4}/)
    if (match) setSessionCode(match[0])
    sendMessage({ text })
  }

  const handleChatFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendToChat(text)
  }

  const handleSendCodeDirectly = () => {
    if (!generatedCode) return
    sendToChat(generatedCode)
  }

  const handleSimulatePayment = async (codeToPay: string) => {
    setIsPaying(true)
    try {
      const res = await simulateCheckout(codeToPay)
      if (res.success) {
        setOrderCompleted(res.order)
      } else {
        alert('Error al simular el pago: ' + res.error)
      }
    } catch {
      alert('Error en el checkout')
    } finally {
      setIsPaying(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-900 antialiased selection:bg-yellow-300 selection:text-black">
      {/* Nav */}
      <header className="border-b-4 border-black bg-[#F2C94C] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 font-mono font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            AGENTO
          </div>
          <span className="font-mono text-sm uppercase tracking-wider font-bold text-black border border-black bg-white px-2 py-0.5">
            Proof of Concept (PoC)
          </span>
        </div>
        <a
          href="/admin"
          target="_blank"
          className="bg-black text-white font-mono uppercase text-sm font-bold px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          📂 Ir al Panel CRM (Payload)
        </a>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <section className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-r-0 lg:border-r-4 border-black">
          <div>
            <div className="border-4 border-black bg-[#F2C94C] text-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              <h2 className="text-2xl font-black uppercase tracking-tight">🔍 Descubrimiento Semántico (RAG)</h2>
              <p className="text-xs font-mono font-bold mt-1 uppercase text-slate-700">
                Alimentado con Embeddings de Gemini & pgvector
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery) }} className="mb-6">
              <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <input
                  type="text"
                  placeholder="Busca artesanías por descripción o material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-4 bg-white text-black font-medium focus:outline-none placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-[#F2C94C] text-black font-black uppercase px-6 border-l-4 border-black hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: '🎒 Mochila Wayuu', query: 'mochila wayuu artesanal' },
                { label: '🤠 Sombrero Vueltiao', query: 'sombrero vueltiao para protegerse del sol' },
                { label: '🏺 Jarrón de Barro', query: 'decoracion rustica barro de raquira' },
              ].map(({ label, query }) => (
                <button
                  key={query}
                  onClick={() => { setSearchQuery(query); performSearch(query) }}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-700 px-3 py-1.5 transition-colors uppercase font-bold text-[#F2C94C]"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-sm uppercase tracking-wider text-slate-400 mb-2 font-bold">
                Resultados del Catálogo ({searchResults.length})
              </h3>
              {isSearching ? (
                <div className="p-8 text-center bg-slate-800 border-2 border-slate-700 font-mono text-slate-400">
                  ⌛ Generando embeddings y buscando similitudes en Postgres...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-800 border-2 border-slate-700 font-mono text-slate-400">
                  No se encontraron productos. Haz una búsqueda o haz click en un tag.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((result) => {
                    const prod = result.product
                    const isSelected = selectedProduct?.id === prod.id
                    return (
                      <div
                        key={prod.id}
                        onClick={() => { setSelectedProduct(prod); setGeneratedCode(null) }}
                        className={`cursor-pointer p-4 border-4 transition-all duration-150 ${
                          isSelected
                            ? 'border-[#F2C94C] bg-slate-800 shadow-[4px_4px_0px_0px_rgba(242,201,76,0.3)]'
                            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          {prod.images?.[0]?.url && (
                            <img
                              src={prod.images[0].url}
                              alt={prod.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-black bg-slate-700 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg text-white">{prod.name}</h4>
                                <span className="bg-slate-700 text-[10px] font-mono px-2 py-0.5 text-slate-300 font-bold uppercase rounded">
                                  ID: {prod.id}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mt-1 line-clamp-2">{prod.description}</p>
                              {prod.materials?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {prod.materials.map((m: string, idx: number) => (
                                    <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-0.5">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex flex-col items-end flex-shrink-0">
                              <span className="font-black text-xl text-[#F2C94C]">
                                ${Number(prod.price_cop).toLocaleString('es-CO')}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">COP</span>
                              <span className="text-xs font-mono text-[#F2C94C] mt-2 font-bold">
                                {(result.similarity * 100).toFixed(1)}% Similitud
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-8 border-4 border-[#F2C94C] bg-slate-950 p-6 shadow-[6px_6px_0px_0px_rgba(242,201,76,0.2)]">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {selectedProduct.images?.[0]?.url && (
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    className="w-full md:w-32 h-32 object-cover border-4 border-[#F2C94C] bg-slate-800 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-black uppercase text-[#F2C94C] text-lg mb-3">
                    ⚙️ Configurar Pedido: {selectedProduct.name}
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addEngraving}
                        onChange={(e) => setAddEngraving(e.target.checked)}
                        className="w-5 h-5 border-2 border-black accent-[#F2C94C]"
                      />
                      <span className="font-mono text-sm uppercase tracking-wider font-bold">
                        ¿Deseas grabado personalizado gratis?
                      </span>
                    </label>
                    {addEngraving && (
                      <input
                        type="text"
                        placeholder="Escribe el texto para el grabado..."
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        className="w-full p-3 bg-white text-black font-semibold border-2 border-black placeholder-slate-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {!generatedCode ? (
                <button
                  onClick={handleHandoff}
                  disabled={isGeneratingHandoff}
                  className="w-full bg-[#F2C94C] text-black font-black uppercase py-4 border-4 border-black hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {isGeneratingHandoff ? 'Congelando Carrito...' : 'Comprar por WhatsApp 📲'}
                </button>
              ) : (
                <div className="bg-[#10B981]/20 border-4 border-[#10B981] p-4 text-white text-center">
                  <p className="font-mono text-xs uppercase font-bold tracking-wider text-[#10B981]">
                    🛒 ¡Carrito Congelado con éxito!
                  </p>
                  <p className="font-black text-3xl font-mono tracking-widest my-2">{generatedCode}</p>
                  <p className="text-xs text-slate-300 mb-4">
                    Usa este código en el chat de WhatsApp (derecha).
                  </p>
                  <button
                    onClick={handleSendCodeDirectly}
                    className="w-full bg-[#10B981] text-black font-black uppercase py-3 border-2 border-black hover:bg-emerald-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                  >
                    🚀 Pegar y Enviar al Chat Automáticamente
                  </button>
                </div>
              )}
              {errorMsg && <p className="text-red-400 text-sm mt-3 font-mono">{errorMsg}</p>}
            </div>
          )}
        </section>

        {/* ── RIGHT PANEL — WhatsApp Simulator ───────────────────── */}
        <section className="bg-slate-300 p-6 sm:p-8 flex flex-col justify-between items-center border-t-4 lg:border-t-0 border-black">
          <div className="w-full max-w-md border-4 border-black bg-white text-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase">💬 Simulador WhatsApp</h2>
            <p className="text-xs font-mono text-slate-600">
              Prueba la experiencia conversacional rehidratando tu carrito congelado.
            </p>
          </div>

          {/* Phone frame */}
          <div className="w-full max-w-md h-[580px] border-4 border-black bg-white flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {/* WA Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-700 border-2 border-black rounded-full flex items-center justify-center font-black font-mono text-sm text-yellow-300">
                  SH
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    Shirley
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${isLoading ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  </h4>
                  <p className="text-[10px] text-slate-300 font-mono">
                    {isLoading ? 'escribiendo...' : 'Agento Sales Agent'}
                  </p>
                </div>
              </div>
              {sessionCode && (
                <span className="bg-[#128C7E] border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase rounded">
                  SESS: {sessionCode}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 bg-[#ECE5DD] overflow-y-auto space-y-3 font-sans text-sm">
              {messages.map((message) => {
                const isUser = message.role === 'user'

                return (
                  <div key={message.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {message.parts?.map((part: any, i: number) => {
                      // Text bubble
                      if (part.type === 'text' && part.text) {
                        return (
                          <div
                            key={i}
                            className={`max-w-[85%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              isUser
                                ? 'bg-[#DCF8C6] text-slate-900 rounded-lg rounded-tr-none'
                                : 'bg-white text-slate-900 rounded-lg rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-line leading-relaxed">{part.text}</p>
                          </div>
                        )
                      }

                      // Ephemeral UI — tool cards (AI SDK v6: state can be 'input-available' or 'output-available')
                      if (part.type === 'tool-showProductCard' && (part.state === 'input-available' || part.state === 'output-available')) {
                        return <ProductCard key={i} {...part.input} />
                      }

                      if (part.type === 'tool-showUpsellCard' && (part.state === 'input-available' || part.state === 'output-available')) {
                        return (
                          <UpsellCard
                            key={i}
                            {...part.input}
                            onAccept={() => sendToChat('Sí, quiero agregar el complemento al pedido')}
                            onReject={() => sendToChat('No gracias, prefiero continuar sin el complemento')}
                          />
                        )
                      }

                      if (part.type === 'tool-showCheckoutCard' && (part.state === 'input-available' || part.state === 'output-available') && !orderCompleted) {
                        return (
                          <CheckoutCard
                            key={i}
                            {...part.input}
                            onPay={() => handleSimulatePayment(part.input.sessionCode)}
                            isPaying={isPaying}
                          />
                        )
                      }

                      return null
                    })}
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">
                      {isUser ? 'Enviado' : 'Shirley'}
                    </span>
                  </div>
                )
              })}

              {/* Order confirmation card */}
              {orderCompleted && (
                <div className="flex flex-col items-start">
                  <ConfirmationCard
                    productName={orderCompleted.productName}
                    totalPriceCop={orderCompleted.totalPrice}
                    wompiTransactionId={orderCompleted.wompiTransactionId}
                    sessionCode={orderCompleted.sessionCode}
                  />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleChatFormSubmit}
              className="border-t-4 border-black p-2 bg-slate-100 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sessionCode ? 'Responde a Shirley...' : 'Ingresa tu código (ej: AX-ABCD)...'}
                disabled={isLoading}
                className="flex-1 p-3 border-2 border-black bg-white text-black text-sm focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#075E54] text-white font-black uppercase px-4 border-2 border-black hover:bg-emerald-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? '...' : 'Enviar'}
              </button>
            </form>
          </div>

          <div className="mt-4 text-center text-xs font-mono text-slate-600 max-w-sm">
            💡 <strong>Cómo funciona:</strong>
            <ol className="list-decimal list-inside text-left mt-1 space-y-1">
              <li>Busca un producto y haz click en <strong>Comprar por WhatsApp</strong>.</li>
              <li>Haz click en el botón verde para enviar el código al chat.</li>
              <li>Acepta o rechaza la sugerencia de Shirley con los botones.</li>
              <li>Haz click en <strong>Simular Pago</strong> y verifica en el Panel CRM.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
