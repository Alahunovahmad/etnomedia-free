'use client'

import { useEffect } from 'react'
import { useWatchProgress } from '@/components/shared/WatchProgressProvider'
import { Movie, Series } from '@/types'
import MovieCard from '@/components/shared/MovieCard'
import SeriesCard from '@/components/shared/SeriesCard'
import GenreChips from '@/components/shared/GenreChips'
import HeroCarouselWrapper from '@/components/shared/HeroCarouselWrapper'

interface HomePageClientProps {
  movies: Movie[]
  series: Series[]
  user: any
}

export default function HomePageClient({ movies, series, user }: HomePageClientProps) {
  const { progress, loadProgress } = useWatchProgress()

  useEffect(() => {
    // Загружаем прогресс для всех фильмов
    const movieIds = movies.map((movie: Movie) => movie.id)
    loadProgress(movieIds)
  }, [movies, loadProgress])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section с новой каруселью */}
      <HeroCarouselWrapper />

      {/* Genre Chips */}
      <GenreChips />

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
