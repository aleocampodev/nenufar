import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={clsx(
        'relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-inherit hover:bg-white/15 transition-all cursor-pointer select-none',
        className,
      )}
      aria-label={`Carrito de compras, ${quantity || 0} piezas`}
      {...rest}
    >
      <div className="relative">
        <ShoppingBag className="w-4 h-4 text-inherit" />
        {typeof quantity === 'number' && quantity > 0 && (
          <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-brand text-white text-[9px] font-bold shadow-sm border border-white/20">
            {quantity}
          </span>
        )}
      </div>
      <span className="hidden sm:inline text-xs tracking-widest font-sans font-medium text-inherit">Carrito</span>
    </Button>
  )
}
