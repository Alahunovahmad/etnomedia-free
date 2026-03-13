'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Добавляем типы для Яндекс.Метрики
declare global {
  interface Window {
    ym: (id: number, method: string, ...params: any[]) => void
  }
}

export default function YandexMetrika() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '107220875'

  useEffect(() => {
    console.log('Yandex Metrika Debug:', {
      metrikaId,
      hasWindowYm: typeof window !== 'undefined' && !!window.ym,
      pathname,
      envVar: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    })
    
    if (metrikaId && typeof window !== 'undefined' && window.ym) {
      // Отправляем hit при изменении маршрута
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      console.log('Sending hit to Metrika:', { metrikaId: parseInt(metrikaId), url })
      window.ym(parseInt(metrikaId), 'hit', url)
    }
  }, [pathname, searchParams, metrikaId])

  return (
    <>
      <Script id="yandex-metrika-init" strategy="afterInteractive">
        {`
          console.log('Initializing Yandex Metrika with ID:', ${metrikaId});
          
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

          try {
            ym(${metrikaId}, 'init', {
              ssr:true, 
              webvisor:true, 
              clickmap:true, 
              ecommerce:"dataLayer", 
              referrer: document.referrer, 
              url: location.href, 
              accurateTrackBounce:true, 
              trackLinks:true
            });
            console.log('Yandex Metrika initialized successfully');
          } catch (error) {
            console.error('Yandex Metrika initialization error:', error);
          }
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
