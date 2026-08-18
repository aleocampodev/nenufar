import { Banner } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>¡Bienvenida al admin de Nénufar!</h4>
      </Banner>
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' la base de datos con productos de ejemplo, luego '}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">visitá la tienda</a>
          {' para ver los resultados.'}
        </li>
        <li>
          {'Los pedidos llegan por Telegram. Configurá '}
          <strong>TELEGRAM_BOT_TOKEN</strong>
          {' y '}
          <strong>TELEGRAM_CHANNEL_ID</strong>
          {' en las variables de entorno para activar las notificaciones.'}
        </li>
        <li>
          {'Gestioná productos, categorías y páginas desde el menú lateral. Los pedidos entrantes aparecen en '}
          <strong>Comercio → Orders</strong>.
        </li>
      </ul>
    </div>
  )
}
