'use client'

import { Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface GenreGridProps {
  genreName: string
  items: any[]
  totalItems: number
  currentPage: number
  totalPages: number
}

export default function GenreGrid({
  genreName,
  items,
  totalItems,
  currentPage,
  totalPages
}: GenreGridProps) {
  const router = useRouter()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (page > 1) {
      params.set('page', page.toString())
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 text-white">
        <div className="bg-red-600 bg-opacity-20 rounded-full p-3">
          <Film className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold capitalize">{genreName}</h1>
          <p className="text-gray-400">
            {totalItems} {getCountWord(totalItems)}
          </p>
        </div>
      </div>

      {/* Content */}
      {items.length > 0 ? (
        <div className="space-y-8">
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`}
                className="group space-y-2"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === 'movie' ? (
                        <Film className="h-12 w-12 text-gray-600" />
                      ) : (
                        <Tv className="h-12 w-12 text-gray-600" />
                      )}
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white">
                    {item.type === 'movie' ? 'Фильм' : 'Сериал'}
                  </div>
                  
                  {/* Rating Badge */}
                  {item.rating && item.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-yellow-500">
                      ⭐ {item.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.year || '—'}</span>
                    {item.duration && item.type === 'movie' && (
                      <span>{item.duration} мин</span>
                    )}
                    {item.type === 'series' && (
                      <span>Сериал</span>
                    )}
                  </div>
                  {item.genres && (
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {item.genres.split(',').slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

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
            В жанре "{genreName}" пока нет контента
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
