'use client'

import { useState } from 'react'
import { Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

interface GenreContentProps {
  genreName: string
  movies: any[]
  series: any[]
  totalMovies: number
  totalSeries: number
  currentPage: number
  totalPages: number
  currentType?: 'movie' | 'series'
}

export default function GenreContent({
  genreName,
  movies,
  series,
  totalMovies,
  totalSeries,
  currentPage,
  totalPages,
  currentType
}: GenreContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'series'>(
    currentType || 'all'
  )

  const handleTabChange = (tab: 'all' | 'movie' | 'series') => {
    setActiveTab(tab)
    
    // Обновляем URL с новым типом
    const newParams = new URLSearchParams(searchParams)
    if (tab === 'all') {
      newParams.delete('type')
    } else {
      newParams.set('type', tab)
    }
    newParams.delete('page') // Сбрасываем страницу при смене типа
    
    router.push(`?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    if (page === 1) {
      newParams.delete('page')
    } else {
      newParams.set('page', page.toString())
    }
    router.push(`?${newParams.toString()}`)
  }

  // Фильтруем контент в зависимости от активной вкладки
  let displayMovies = movies
  let displaySeries = series
  let totalItems = totalMovies + totalSeries

  if (activeTab === 'movie') {
    displaySeries = []
    totalItems = totalMovies
  } else if (activeTab === 'series') {
    displayMovies = []
    totalItems = totalSeries
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-white">
          <div className="bg-red-600 bg-opacity-20 rounded-full p-3">
            <Film className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold capitalize">{genreName}</h1>
            <p className="text-gray-400">
              {totalItems} {getCountWord(totalItems)} в этом жанре
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>Все</span>
            <span className="text-xs">({totalMovies + totalSeries})</span>
          </button>
          
          <button
            onClick={() => handleTabChange('movie')}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'movie'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Фильмы</span>
            <span className="text-xs">({totalMovies})</span>
          </button>
          
          <button
            onClick={() => handleTabChange('series')}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'series'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Tv className="h-4 w-4" />
            <span>Сериалы</span>
            <span className="text-xs">({totalSeries})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {(displayMovies.length > 0 || displaySeries.length > 0) ? (
        <div className="space-y-8">
          {/* Movies */}
          {displayMovies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <Film className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-semibold">
                  Фильмы {activeTab === 'movie' && `(${displayMovies.length})`}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayMovies.map((movie) => (
                  <Link 
                    key={`movie-${movie.id}`}
                    href={`/movie/${movie.id}`}
                    className="group space-y-2"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Rating Badge */}
                      {movie.rating && movie.rating > 0 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-yellow-500">
                          ⭐ {movie.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-600 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{movie.year || '—'}</span>
                        {movie.duration && (
                          <span>{movie.duration} мин</span>
                        )}
                      </div>
                      {movie.genres && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {movie.genres.split(',').slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Series */}
          {displaySeries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white">
                <Tv className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-semibold">
                  Сериалы {activeTab === 'series' && `(${displaySeries.length})`}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displaySeries.map((serie) => (
                  <Link 
                    key={`series-${serie.id}`}
                    href={`/series/${serie.id}`}
                    className="group space-y-2"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      {serie.posterUrl ? (
                        <Image
                          src={serie.posterUrl}
                          alt={serie.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tv className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Rating Badge */}
                      {serie.rating && serie.rating > 0 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-yellow-500">
                          ⭐ {serie.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-600 transition-colors">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{serie.year || '—'}</span>
                        <span>Сериал</span>
                      </div>
                      {serie.genres && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {serie.genres.split(',').slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-8 border-t border-gray-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Назад</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-md transition-colors ${
                        pageNumber === currentPage
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors text-white"
              >
                <span>Вперед</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Film className="h-10 w-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Ничего не найдено</h2>
          <p className="text-gray-400 mb-6">
            В жанре "{genreName}" пока нет {activeTab === 'movie' ? 'фильмов' : activeTab === 'series' ? 'сериалов' : 'контента'}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>На главную</span>
          </Link>
        </div>
      )}
    </div>
  )
}

function getCountWord(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'результатов'
  }
  
  if (lastDigit === 1) {
    return 'результат'
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'результата'
  }
  
  return 'результатов'
}
