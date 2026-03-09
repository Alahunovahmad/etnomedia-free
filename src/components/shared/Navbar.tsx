'use client'

import { User, LogOut, Menu, X, Home, Film, Tv, Search } from 'lucide-react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              ETNOMEDIA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Главная
              </Link>
              <Link href="/movies" className="text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Фильмы
              </Link>
              <Link href="/series" className="text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Сериалы
              </Link>
              <SearchComponent />
            </div>
          </div>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center space-x-3">
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
                  <span className="text-white text-sm font-medium hidden lg:block">
                    {user.firstName || 'Пользователь'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800"
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <SearchComponent />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
              aria-label="Открыть меню"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          />

          {/* Menu panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Меню</h2>
                <button
                  onClick={closeMobileMenu}
                  className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-4">
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 text-white hover:bg-gray-800 hover:text-red-600 px-3 py-3 rounded-md transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Главная</span>
                  </Link>
                  
                  <Link
                    href="/movies"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 text-gray-300 hover:bg-gray-800 hover:text-red-600 px-3 py-3 rounded-md transition-colors"
                  >
                    <Film className="h-5 w-5" />
                    <span className="font-medium">Фильмы</span>
                  </Link>
                  
                  <Link
                    href="/series"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 text-gray-300 hover:bg-gray-800 hover:text-red-600 px-3 py-3 rounded-md transition-colors"
                  >
                    <Tv className="h-5 w-5" />
                    <span className="font-medium">Сериалы</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-4"></div>

                {/* User section */}
                <div className="px-4">
                  {loading ? (
                    <div className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {user.firstName || 'Пользователь'}
                          </p>
                          <p className="text-gray-400 text-sm">Авторизован</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md text-center font-medium transition-colors"
                    >
                      Войти
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
