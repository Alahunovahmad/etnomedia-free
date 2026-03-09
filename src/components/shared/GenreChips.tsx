'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GenreChip {
  name: string
  totalCount: number
}

export default function GenreChips() {
  const [genres, setGenres] = useState<GenreChip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres')
        if (response.ok) {
          const data = await response.json()
          // Берем только топ 8 жанров для чипов
          setGenres(data.genres.slice(0, 8))
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
      <div className="flex justify-center py-6">
        <div className="flex space-x-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-800 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (genres.length === 0) {
    return null
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              href={`/genre/${encodeURIComponent(genre.name.toLowerCase())}`}
              className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white border border-gray-700 hover:border-red-600 rounded-full text-sm font-medium transition-all duration-300 hover:transform hover:scale-105"
            >
              <span>{genre.name}</span>
              <span className="ml-2 text-xs opacity-75">
                {genre.totalCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
