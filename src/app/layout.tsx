import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../../filter-logs' // Фильтрация логов
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ContinueWatchingProvider from '@/components/player/ContinueWatchingProvider'
import TelegramBypass from '@/components/shared/TelegramBypass'
import SupportWidget from '@/components/shared/SupportWidget'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETNOMEDIA - Онлайн-кинотеатр',
  description: 'Смотрите лучшие фильмы и сериалы онлайн',
  other: {
    'yandex-metrika': `
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107220875', 'ym');

    ym(107220875, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/107220875" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
    `
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const maintenanceMode = await isMaintenanceMode()
  const user = await getUser()
  const isAdmin = user?.role === 'ADMIN'
  
  // Показываем навигацию только если не режим обслуживания или пользователь админ
  const showNavigation = !maintenanceMode || isAdmin

  return (
    <html lang="ru">
      <head>
        {/* Yandex Metrika counter */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107220875', 'ym');

              ym(107220875, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
            `
          }}
        />
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/107220875" 
              style={{ position: 'absolute', left: '-9999px' }} 
              alt="" 
            />
          </div>
        </noscript>
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        {showNavigation && <Navbar />}
        <ContinueWatchingProvider>
          <main className="flex-1">
            {children}
          </main>
        </ContinueWatchingProvider>
        {showNavigation && <Footer />}
        <TelegramBypass />
        <SupportWidget />
      </body>
    </html>
  )
}
