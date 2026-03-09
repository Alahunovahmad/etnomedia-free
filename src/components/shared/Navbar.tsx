'use client'

import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import SearchComponent from './SearchComponent'

interface UserProfile {
  firstName: string | null
  photoUrl: string | null
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем авторизацию при монтировании компонента
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser({
            firstName: userData.firstName,
            photoUrl: userData.photoUrl
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              ETNOMEDIA
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-white hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Главная
              </Link>
              <Link href="/movies" className="text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Фильмы
              </Link>
              <Link href="/series" className="text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Сериалы
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <SearchComponent />
            
            {loading ? (
              <div className="w-20 h-8 bg-gray-700 rounded-md animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <span className="text-white text-sm font-medium">
                    {user.firstName || 'Пользователь'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors p-1"
                  title="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-white font-medium">Меню</span>
            <SearchComponent />
          </div>
          <Link href="/" className="text-white hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium">
            Главная
          </Link>
          <Link href="/movies" className="text-gray-300 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium">
            Фильмы
          </Link>
          <Link href="/series" className="text-gray-300 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium">
            Сериалы
          </Link>
        </div>
      </div>
    </nav>
  )
}
