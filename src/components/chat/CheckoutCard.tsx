'use client'

interface CheckoutCardProps {
  productName: string
  productPriceCop: number
  upsellName: string | null
  upsellPriceCop: number | null
  totalPriceCop: number
  sessionCode: string
  onPay: () => void
  isPaying: boolean
}

export function CheckoutCard({
  productName,
  productPriceCop,
  upsellName,
  upsellPriceCop,
  totalPriceCop,
  sessionCode,
  onPay,
  isPaying,
}: CheckoutCardProps) {
  return (
    <div className="my-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="bg-[#075E54] border-b-2 border-black px-4 py-2 flex items-center gap-2">
        <span className="text-lg">💳</span>
        <span className="font-mono font-black uppercase text-xs tracking-widest text-white">
          Resumen del Pedido
        </span>
      </div>

      {/* Line items */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-700 font-medium truncate pr-2">{productName}</span>
          <span className="font-mono font-bold text-black whitespace-nowrap">
            ${Number(productPriceCop).toLocaleString('es-CO')}
          </span>
        </div>

        {upsellName && upsellPriceCop && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-emerald-700 font-medium truncate pr-2">+ {upsellName}</span>
            <span className="font-mono font-bold text-emerald-700 whitespace-nowrap">
              +${Number(upsellPriceCop).toLocaleString('es-CO')}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-black border-dashed pt-2">
          <div className="flex justify-between items-center">
            <span className="font-black uppercase text-sm">Total</span>
            <span className="font-black text-xl font-mono text-black">
              ${Number(totalPriceCop).toLocaleString('es-CO')}
              <span className="text-[10px] text-slate-500 ml-1 font-normal">COP</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Sesión: {sessionCode}
          </span>
        </div>

        {/* Pay button */}
        <button
          onClick={onPay}
          disabled={isPaying}
          className="w-full mt-2 bg-[#F2C94C] text-black font-black uppercase text-sm py-3 border-2 border-black hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {isPaying ? '⏳ Procesando...' : '💳 Simular Pago Exitoso'}
        </button>
      </div>
    </div>
  )
}
