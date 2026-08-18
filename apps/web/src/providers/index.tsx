import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
// Nénufar v3.1: Stripe client removed — checkout terminates in Telegram (server-side, invisible)
// import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                  },
                },
              },
            }}
            // Nénufar v3.1: no client-side payment methods — Telegram dispatch is server-only
            paymentMethods={[]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
