'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Добавляем типы для Яндекс.Метрики
declare global {
  interface Window {
    ym: (id: string, method: string, ...params: any[]) => void
  }
}

export default function YandexMetrika() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

  useEffect(() => {
    if (metrikaId && typeof window !== 'undefined' && window.ym) {
      // Отправляем hit при изменении маршрута
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      window.ym(metrikaId, 'hit', url)
    }
  }, [pathname, searchParams, metrikaId])

  if (!metrikaId) {
    return null
  }

  return (
    <>
      <Script id="yandex-metrika-init" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${metrikaId}, "init", {
            defer: true,
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer"
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${metrikaId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}
