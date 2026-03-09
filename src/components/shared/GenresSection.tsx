'use client'

import { useState, useEffect } from 'react'
import { Film, Tv, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Genre {
  name: string
  movieCount: number
  seriesCount: number
  totalCount: number
}

export default function GenresSection() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres')
        if (response.ok) {
          const data = await response.json()
          setGenres(data.genres || [])
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Жанры</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (genres.length === 0) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Жанры</h2>
        <div className="text-center py-12 text-gray-400">
          <p>Жанры не найдены</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-white mb-8">Жанры</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <Link
            key={genre.name}
            href={`/genre/${encodeURIComponent(genre.name.toLowerCase())}`}
            className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-red-600 rounded-lg p-4 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="text-center space-y-2">
              {/* Genre Icon */}
              <div className="flex justify-center">
                <div className="bg-red-600 bg-opacity-20 group-hover:bg-opacity-30 rounded-full p-3 transition-colors">
                  <Film className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              {/* Genre Name */}
              <h3 className="text-white font-medium text-sm group-hover:text-red-600 transition-colors capitalize">
                {genre.name}
              </h3>
              
              {/* Count */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                {genre.movieCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <Film className="h-3 w-3" />
                    <span>{genre.movieCount}</span>
                  </span>
                )}
                {genre.seriesCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <Tv className="h-3 w-3" />
                    <span>{genre.seriesCount}</span>
                  </span>
                )}
              </div>
              
              {/* Total Count Badge */}
              <div className="text-xs text-gray-500">
                {genre.totalCount} {getCountWord(genre.totalCount)}
              </div>
            </div>
          </Link>
        ))}
      </div>
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
