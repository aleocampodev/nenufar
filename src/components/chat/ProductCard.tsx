'use client'

interface ProductCardProps {
  productName: string
  priceCop: number
  engraving: string | null
  sessionCode: string
}

export function ProductCard({ productName, priceCop, engraving, sessionCode }: ProductCardProps) {
  return (
    <div className="my-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="bg-[#F2C94C] border-b-2 border-black px-4 py-2 flex items-center gap-2">
        <span className="text-lg">🛒</span>
        <span className="font-mono font-black uppercase text-xs tracking-widest text-black">
          Pedido Confirmado
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="font-black text-base text-black leading-tight">{productName}</p>

        <div className="flex items-baseline gap-1">
          <span className="font-black text-xl text-black font-mono">
            ${Number(priceCop).toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">COP</span>
        </div>

        {engraving && (
          <div className="bg-slate-100 border border-slate-300 px-3 py-1.5">
            <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">Grabado</p>
            <p className="text-sm font-semibold text-slate-800 italic">"{engraving}"</p>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
            Sesión: {sessionCode}
          </span>
        </div>
      </div>
    </div>
  )
}
