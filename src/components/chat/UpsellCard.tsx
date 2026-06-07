'use client'

interface UpsellCardProps {
  upsellName: string
  upsellPriceCop: number
  sessionCode: string
  onAccept: () => void
  onReject: () => void
}

export function UpsellCard({ upsellName, upsellPriceCop, onAccept, onReject }: UpsellCardProps) {
  return (
    <div className="my-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="bg-black border-b-2 border-black px-4 py-2 flex items-center gap-2">
        <span className="text-lg">🎁</span>
        <span className="font-mono font-black uppercase text-xs tracking-widest text-[#F2C94C]">
          Oferta Especial
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <p className="font-bold text-sm text-black leading-tight">{upsellName}</p>

        <div className="flex items-baseline gap-1">
          <span className="font-black text-lg text-black font-mono">
            +${Number(upsellPriceCop).toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">COP</span>
        </div>

        <p className="text-[11px] text-slate-500 font-mono">
          ¿Deseas agregar este complemento a tu pedido?
        </p>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onAccept}
            className="flex-1 bg-[#F2C94C] text-black font-black uppercase text-xs py-2 px-3 border-2 border-black hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            ✅ Sí, agregar
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-white text-black font-black uppercase text-xs py-2 px-3 border-2 border-black hover:bg-slate-100 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            ❌ No, gracias
          </button>
        </div>
      </div>
    </div>
  )
}
