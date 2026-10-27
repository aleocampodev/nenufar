import Script from 'next/script'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    // Nenúfar editorial brand palette: warm cream (#FAF8F5) and pure white (#FFFFFF).
    var themeToSet = '${defaultTheme}';
    document.documentElement.setAttribute('data-theme', themeToSet);
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
