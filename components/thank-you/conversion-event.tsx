'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function ConversionEvent({ sendTo }: { sendTo: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    window.dataLayer = window.dataLayer || []
    const gtag =
      window.gtag ??
      function () {
        // gtag.js expects the raw arguments object, not an array
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments)
      }
    gtag('event', 'conversion', { send_to: sendTo })
  }, [sendTo])

  return null
}
