'use client'

import React, { useState, useEffect, useRef } from 'react'
import { handleSearch } from './actions/search'
import { createHandoffSession } from './actions/handoff'
import { sendMessageToChat, simulateCheckout, ChatMessage } from './actions/chat'

export default function HomePage() {
  // Left panel states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  
  // Customization states
  const [addEngraving, setAddEngraving] = useState(false)
  const [engravingText, setEngravingText] = useState('')
  
  // Handoff states
  const [isGeneratingHandoff, setIsGeneratingHandoff] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Right panel (WhatsApp Simulator) states
  const [sessionCode, setSessionCode] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '¡Hola! Soy Shirley, tu asistente de compras en Agento. 🇨🇴🛍️\n\nPor favor, escribe o pega tu código de compra (ejemplo: `AX-H3B9`) para rehidratar tu carrito y guiarte con el pago.',
    },
  ])
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Initial search load
  useEffect(() => {
    performSearch('artesanías tradicionales')
  }, [])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    setErrorMsg(null)
    try {
      const results = await handleSearch(query)
      setSearchResults(results)
      // Auto-select the first product if none selected
      if (results.length > 0) {
        setSelectedProduct(results[0].product)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Error al buscar productos. Inténtalo de nuevo.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleChipClick = (queryText: string) => {
    setSearchQuery(queryText)
    performSearch(queryText)
  }

  const handleFormSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

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
    } catch (err) {
      console.error(err)
      setErrorMsg('Ocurrió un error inesperado. Inténtalo de nuevo.')
    } finally {
      setIsGeneratingHandoff(false)
    }
  }

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return
    
    const newUserMessage: ChatMessage = { role: 'user', text: textToSend }
    const updatedHistory = [...chatHistory, newUserMessage]
    setChatHistory(updatedHistory)
    setChatInput('')
    setIsSendingMessage(true)

    try {
      const res = await sendMessageToChat(sessionCode, textToSend, updatedHistory)
      
      if (res.success) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'model', text: res.reply },
        ])
        if (res.sessionCode) {
          setSessionCode(res.sessionCode)
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'model', text: 'Error de conexión. Inténtalo de nuevo.' },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleSendCodeDirectly = () => {
    if (!generatedCode) return
    handleSendMessage(generatedCode)
  }

  const handleSimulatePayment = async (codeToPay: string) => {
    setIsPaying(true)
    try {
      const res = await simulateCheckout(codeToPay)
      if (res.success) {
        setOrderCompleted(res.order)
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'model',
            text: `🎉 ¡PAGO CONFIRMADO! Shirley aquí: Recibimos tu pago de $${Number(
              res.order?.totalPrice
            ).toLocaleString('es-CO')} COP con éxito para el pedido **${
              res.order?.productName
            }**. Hemos generado tu orden de despacho en el panel del CRM administrativo. \n\nID de Transacción Wompi: \`${res.order?.wompiTransactionId}\`\nCódigo de Pedido: \`${codeToPay}\`.`,
          },
        ])
      } else {
        alert('Error al simular el pago: ' + res.error)
      }
    } catch (err) {
      console.error(err)
      alert('Error en el checkout')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-900 antialiased selection:bg-yellow-300 selection:text-black">
      {/* Top Brutalist Navigation Bar */}
      <header className="border-b-4 border-black bg-[#F2C94C] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 font-mono font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            AGENTO
          </div>
          <span className="font-mono text-sm uppercase tracking-wider font-bold text-black border border-black bg-white px-2 py-0.5">
            Proof of Concept (PoC)
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href="/admin"
            target="_blank"
            className="bg-black text-white font-mono uppercase text-sm font-bold px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            📂 Ir al Panel CRM (Payload)
          </a>
        </div>
      </header>

      {/* Main Split Screen Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: Discovery, RAG & Handoff */}
        <section className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-r-0 lg:border-r-4 border-black">
          <div>
            <div className="border-4 border-black bg-[#F2C94C] text-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                🔍 Descubrimiento Semántico (RAG)
              </h2>
              <p className="text-xs font-mono font-bold mt-1 uppercase text-slate-700">
                Alimentado con Embeddings de Gemini & pgvector
              </p>
            </div>

            {/* Semantic Search Box */}
            <form onSubmit={handleFormSearchSubmit} className="mb-6">
              <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <input
                  type="text"
                  placeholder="Busca artesanías por descripción o material... (ej. mochila de lana, sombrero soleado)"
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

            {/* Intent Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => handleChipClick('mochila wayuu artesanal')}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-700 px-3 py-1.5 transition-colors uppercase font-bold text-[#F2C94C]"
              >
                🎒 Mochila Wayuu
              </button>
              <button
                onClick={() => handleChipClick('sombrero vueltiao para protegerse del sol')}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-700 px-3 py-1.5 transition-colors uppercase font-bold text-[#F2C94C]"
              >
                🤠 Sombrero Vueltiao
              </button>
              <button
                onClick={() => handleChipClick('decoracion rustica barro de raquira')}
                className="bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-700 px-3 py-1.5 transition-colors uppercase font-bold text-[#F2C94C]"
              >
                🏺 Jarrón de Barro
              </button>
            </div>

            {/* Product Search Results */}
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
                        onClick={() => {
                          setSelectedProduct(prod)
                          setGeneratedCode(null) // Reset code when product changes
                        }}
                        className={`cursor-pointer p-4 border-4 transition-all duration-150 ${
                          isSelected
                            ? 'border-[#F2C94C] bg-slate-800 shadow-[4px_4px_0px_0px_rgba(242,201,76,0.3)]'
                            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-lg text-white">
                                {prod.name}
                              </h4>
                              <span className="bg-slate-700 text-[10px] font-mono px-2 py-0.5 text-slate-300 font-bold uppercase rounded">
                                ID: {prod.id}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                              {prod.description}
                            </p>
                            {prod.materials && prod.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {prod.materials.map((m: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-0.5"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="font-black text-xl text-[#F2C94C]">
                              ${Number(prod.price_cop).toLocaleString('es-CO')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                              COP
                            </span>
                            <span className="text-xs font-mono text-[#F2C94C] mt-2 font-bold">
                              {(result.similarity * 100).toFixed(1)}% Similitud
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Configuration & Handoff Trigger */}
          {selectedProduct && (
            <div className="mt-8 border-4 border-[#F2C94C] bg-slate-950 p-6 shadow-[6px_6px_0px_0px_rgba(242,201,76,0.2)]">
              <h3 className="font-black uppercase text-[#F2C94C] text-lg mb-3">
                ⚙️ Configurar Pedido: {selectedProduct.name}
              </h3>
              
              <div className="space-y-4 mb-6">
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
                    placeholder="Escribe el nombre o texto para el grabado... (ej: 'Para Papá')"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    className="w-full p-3 bg-white text-black font-semibold border-2 border-black placeholder-slate-400 focus:outline-none"
                  />
                )}
              </div>

              {!generatedCode ? (
                <button
                  onClick={handleHandoff}
                  disabled={isGeneratingHandoff}
                  className="w-full bg-[#F2C94C] text-black font-black uppercase py-4 border-4 border-black hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {isGeneratingHandoff ? 'Congelando Carrito...' : 'Comprar por WhatsApp 📲'}
                </button>
              ) : (
                <div className="bg-[#10B981]/20 border-4 border-[#10B981] p-4 text-white text-center">
                  <p className="font-mono text-xs uppercase font-bold tracking-wider text-[#10B981]">
                    🛒 ¡Carrito Congelado con éxito!
                  </p>
                  <p className="font-black text-3xl font-mono tracking-widest my-2 text-white">
                    {generatedCode}
                  </p>
                  <p className="text-xs text-slate-300 mb-4">
                    Usa este código en el chat de WhatsApp (derecha) para rehidratar tu pedido.
                  </p>
                  <button
                    onClick={handleSendCodeDirectly}
                    className="w-full bg-[#10B981] text-black font-black uppercase py-3 border-2 border-black hover:bg-emerald-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  >
                    🚀 Pegar y Enviar al Chat Automáticamente
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT PANEL: WhatsApp Chat Simulator */}
        <section className="bg-slate-300 p-6 sm:p-8 flex flex-col justify-between items-center border-t-4 lg:border-t-0 border-black">
          
          {/* Header Info */}
          <div className="w-full max-w-md border-4 border-black bg-white text-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase">
              💬 Simulador WhatsApp
            </h2>
            <p className="text-xs font-mono text-slate-600">
              Prueba la experiencia conversacional rehidratando tu carrito congelado.
            </p>
          </div>

          {/* Simulated Mobile Device container */}
          <div className="w-full max-w-md h-[550px] border-4 border-black bg-white flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            
            {/* Chat Device Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-700 border-2 border-black rounded-full flex items-center justify-center font-black font-mono text-sm text-yellow-300">
                  SH
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    Shirley
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  </h4>
                  <p className="text-[10px] text-slate-300 font-mono">Agento Sales Agent</p>
                </div>
              </div>
              <div className="flex gap-2">
                {sessionCode && (
                  <span className="bg-[#128C7E] border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase rounded">
                    SESS: {sessionCode}
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 bg-[#ECE5DD] overflow-y-auto space-y-4 font-sans text-sm">
              {chatHistory.map((chat, idx) => {
                const isUser = chat.role === 'user'
                // Check if the chat includes a mock link
                const linkMatch = chat.text.match(/https:\/\/checkout\.wompi\.co\/l\/mock-[A-Z0-9-]+/)
                const paymentLink = linkMatch ? linkMatch[0] : null
                
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        isUser
                          ? 'bg-[#DCF8C6] text-slate-900 rounded-lg rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-lg rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{chat.text}</p>
                      
                      {/* Interactive mock pay button for Wompi */}
                      {paymentLink && !orderCompleted && (
                        <div className="mt-3 pt-3 border-t border-slate-300">
                          <button
                            onClick={() => handleSimulatePayment(sessionCode!)}
                            disabled={isPaying}
                            className="w-full bg-[#F2C94C] text-black font-black uppercase text-xs py-2 px-3 border-2 border-black hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                          >
                            {isPaying ? 'Procesando Pago...' : '💳 Simular Pago Exitoso'}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">
                      {isUser ? 'Enviado' : 'Shirley'}
                    </span>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(chatInput)
              }}
              className="border-t-4 border-black p-2 bg-slate-100 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  sessionCode
                    ? 'Responde a Shirley...'
                    : 'Ingresa tu código (ej: AX-ABCD)...'
                }
                disabled={isSendingMessage}
                className="flex-1 p-3 border-2 border-black bg-white text-black text-sm focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !chatInput.trim()}
                className="bg-[#075E54] text-white font-black uppercase px-4 border-2 border-black hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {isSendingMessage ? '...' : 'Enviar'}
              </button>
            </form>
          </div>

          <div className="mt-4 text-center text-xs font-mono text-slate-600 max-w-sm">
            💡 <strong>Cómo funciona el flujo:</strong>
            <ol className="list-decimal list-inside text-left mt-1 space-y-1">
              <li>Haz clic en un tag de búsqueda o ingresa un término.</li>
              <li>Configura tu grabado y haz clic en <strong>Comprar por WhatsApp</strong>.</li>
              <li>Haz clic en el botón verde para enviar el código generado al chat.</li>
              <li>Acepta/Rechaza la sugerencia de Shirley y haz clic en <strong>Simular Pago</strong>.</li>
              <li>¡Verifica el pedido en el Panel CRM (/admin)!</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
