'use client'

import { Search, Film, Tv } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SearchResultsProps {
  query: string
  movies: any[]
  series: any[]
}

export default function SearchResults({ query, movies, series }: SearchResultsProps) {
  const totalResults = movies.length + series.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 text-white">
        <Search className="h-6 w-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">Результаты поиска</h1>
          <p className="text-gray-400">
            По запросу "{query}" найдено: {totalResults} {getResultsWord(totalResults)}
          </p>
        </div>
      </div>

      {/* No Results */}
      {totalResults === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Ничего не найдено</h2>
          <p className="text-gray-400 mb-6">
            Попробуйте изменить поисковый запрос или проверить орфографию
          </p>
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>На главную</span>
          </Link>
        </div>
      )}

      {/* Movies Results */}
      {movies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Film className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Фильмы ({movies.length})</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
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

      {/* Series Results */}
      {series.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Tv className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Сериалы ({series.length})</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {series.map((serie) => (
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

      {/* View More */}
      {totalResults > 0 && (
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              Показано {totalResults} {getResultsWord(totalResults)}
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/movies"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Все фильмы
              </Link>
              <Link 
                href="/series"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Все сериалы
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getResultsWord(count: number): string {
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
