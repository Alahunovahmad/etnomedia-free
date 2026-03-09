'use client'

import { useEffect } from 'react'
import { useWatchProgress } from '@/components/shared/WatchProgressProvider'
import { Movie, Series } from '@/types'
import MovieCard from '@/components/shared/MovieCard'
import SeriesCard from '@/components/shared/SeriesCard'
import GenresSection from '@/components/shared/GenresSection'

interface HomePageClientProps {
  movies: Movie[]
  series: Series[]
}

export default function HomePageClient({ movies, series }: HomePageClientProps) {
  const { progress, loadProgress } = useWatchProgress()

  useEffect(() => {
    // Загружаем прогресс для всех фильмов
    const movieIds = movies.map((movie: Movie) => movie.id)
    loadProgress(movieIds)
  }, [movies, loadProgress])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              ГОРЯЧИЕ
              <span className="text-red-600"> НОВИНКИ</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Смотрите лучшие премьеры этого месяца в высоком качестве
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors">
              Смотреть
            </button>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Популярные фильмы</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie: Movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              watchProgress={progress[movie.id]}
            />
          ))}
        </div>
      </section>

      {/* Genres Section */}
      <GenresSection />

      {/* Series Grid */}
      {series.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-white mb-8">Популярные сериалы</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {series.map((item: Series) => (
              <SeriesCard key={item.id} series={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
