import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { formatOrderMessage, formatWhatsAppLink } from '@/lib/order-formatter'
import type { Cart } from '@/payload-types'

// Minimal cart fixture — only the fields formatOrderMessage reads
function makeCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 'cart-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtotal: 150000,
    currency: 'COP',
    items: [
      {
        id: 'item-1',
        quantity: 2,
        product: {
          id: 'prod-1',
          title: 'Argolla de plata',
          slug: 'argolla-de-plata',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          priceInCOP: 75000,
        } as unknown as Cart['items'][number]['product'],
        variant: null,
      },
    ],
    ...overrides,
  } as unknown as Cart
}

const BUYER = { name: 'María Quintana', contact: '+57 321 456 7890' }
const FIXED_DATE = new Date('2026-08-18T15:00:00-05:00') // Bogotá

beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://nenufar.co'
})

afterAll(() => {
  delete process.env.NEXT_PUBLIC_SERVER_URL
})

describe('formatOrderMessage', () => {
  it('incluye orderId, nombre y contacto del comprador', () => {
    const msg = formatOrderMessage({ cart: makeCart(), buyer: BUYER, orderId: 'ORD-001', timestamp: FIXED_DATE })
    expect(msg).toContain('#ORD-001')
    expect(msg).toContain('María Quintana')
    expect(msg).toContain('+57 321 456 7890')
  })

  it('muestra el título del producto y cantidad', () => {
    const msg = formatOrderMessage({ cart: makeCart(), buyer: BUYER, orderId: 'ORD-002', timestamp: FIXED_DATE })
    expect(msg).toContain('Argolla de plata')
    expect(msg).toContain('×2')
  })

  it('usa cart.subtotal como total cuando está disponible', () => {
    const msg = formatOrderMessage({ cart: makeCart({ subtotal: 150000 }), buyer: BUYER, orderId: 'ORD-003', timestamp: FIXED_DATE })
    expect(msg).toContain('150')
    expect(msg).toContain('COP')
  })

  it('calcula el total desde items cuando cart.subtotal es null', () => {
    const cart = makeCart({ subtotal: null })
    const msg = formatOrderMessage({ cart, buyer: BUYER, orderId: 'ORD-004', timestamp: FIXED_DATE })
    // 2 × 75000 = 150000
    expect(msg).toContain('150')
  })

  it('escapa HTML en nombre y contacto del comprador', () => {
    const buyer = { name: '<script>xss</script>', contact: 'test@example.com' }
    const msg = formatOrderMessage({ cart: makeCart(), buyer, orderId: 'ORD-005', timestamp: FIXED_DATE })
    expect(msg).not.toContain('<script>')
    expect(msg).toContain('&lt;script&gt;')
  })

  it('incluye nota del carrito cuando está presente', () => {
    const cart = makeCart({ note: 'Envolver para regalo' } as any)
    const msg = formatOrderMessage({ cart, buyer: BUYER, orderId: 'ORD-006', timestamp: FIXED_DATE })
    expect(msg).toContain('Envolver para regalo')
  })

  it('no incluye bloque de notas cuando no hay nota', () => {
    const msg = formatOrderMessage({ cart: makeCart(), buyer: BUYER, orderId: 'ORD-007', timestamp: FIXED_DATE })
    expect(msg).not.toContain('Notas del pedido')
  })

  it('incluye el link al admin de Payload en el footer', () => {
    const msg = formatOrderMessage({ cart: makeCart(), buyer: BUYER, orderId: 'ORD-008', timestamp: FIXED_DATE })
    expect(msg).toContain('https://nenufar.co/admin/collections/orders')
  })

  it('incluye variantes cuando el item las tiene', () => {
    const cartWithVariant = makeCart()
    cartWithVariant.items![0]!.variant = {
      id: 'var-1',
      options: [{ variantType: 'Talla', value: 'S' }],
    } as any
    const msg = formatOrderMessage({ cart: cartWithVariant, buyer: BUYER, orderId: 'ORD-009', timestamp: FIXED_DATE })
    expect(msg).toContain('Talla')
    expect(msg).toContain('S')
  })

  it('produce un mensaje de menos de 4000 chars para un carrito normal', () => {
    const msg = formatOrderMessage({ cart: makeCart(), buyer: BUYER, orderId: 'ORD-010', timestamp: FIXED_DATE })
    expect(msg.length).toBeLessThan(4000)
  })
})

describe('formatWhatsAppLink', () => {
  it('genera un link de wa.me con el orderId', () => {
    const link = formatWhatsAppLink(BUYER, 'ORD-001')
    expect(link).toContain('wa.me')
    expect(link).toContain('ORD-001')
  })

  it('URL-encodea el texto del mensaje', () => {
    const link = formatWhatsAppLink(BUYER, 'ORD-001')
    expect(link).not.toContain(' ')
  })
})
