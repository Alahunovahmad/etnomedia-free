import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ContinueWatchingProvider from '@/components/player/ContinueWatchingProvider'
import YandexMetrika from '@/components/shared/YandexMetrika'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETNOMEDIA - Онлайн-кинотеатр',
  description: 'Смотрите лучшие фильмы и сериалы онлайн',
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
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        {showNavigation && <Navbar />}
        <ContinueWatchingProvider>
          <main className="flex-1">
            {children}
          </main>
        </ContinueWatchingProvider>
        {showNavigation && <Footer />}
        <YandexMetrika />
      </body>
    </html>
  )
}
