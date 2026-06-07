'use client'

interface ConfirmationCardProps {
  productName: string
  totalPriceCop: number
  wompiTransactionId: string
  sessionCode: string
}

export function ConfirmationCard({
  productName,
  totalPriceCop,
  wompiTransactionId,
  sessionCode,
}: ConfirmationCardProps) {
  return (
    <div className="my-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="bg-emerald-500 border-b-2 border-black px-4 py-2 flex items-center gap-2">
        <span className="text-lg">🎉</span>
        <span className="font-mono font-black uppercase text-xs tracking-widest text-white">
          ¡Pago Confirmado!
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="font-bold text-sm text-black">{productName}</p>

        <div className="flex items-baseline gap-1">
          <span className="font-black text-xl font-mono text-emerald-600">
            ${Number(totalPriceCop).toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">COP pagados</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-3 py-2 space-y-1">
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-400 font-bold">ID Wompi</p>
            <p className="text-[11px] font-mono text-slate-700 break-all">{wompiTransactionId}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-400 font-bold">Código</p>
            <p className="text-[11px] font-mono text-slate-700">{sessionCode}</p>
          </div>
        </div>

        <a
          href="/admin/collections/orders"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full mt-1 bg-black text-white font-black uppercase text-xs py-2 border-2 border-black hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_0px_#F2C94C]"
        >
          📂 Ver en Panel CRM
        </a>
      </div>
    </div>
  )
}
