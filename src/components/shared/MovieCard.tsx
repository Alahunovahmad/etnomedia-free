import { Play } from 'lucide-react'
import { Movie } from '@/types'
import Link from 'next/link'

interface MovieCardProps {
  movie: Movie
  watchProgress?: number // в процентах (0-100)
}

export default function MovieCard({ movie, watchProgress }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className="block group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <img
          src={movie.posterUrl || '/placeholder-movie.jpg'}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Progress bar */}
        {watchProgress && watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${Math.min(watchProgress, 100)}%` }}
            />
          </div>
        )}
        
        {/* Overlay with play button */}
        <div className="movie-card-overlay">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Play className="h-5 w-5" />
            <span>Смотреть</span>
          </button>
        </div>
        
        {/* Movie info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{movie.year || 'N/A'}</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span>{movie.rating || 'N/A'}</span>
            </div>
          </div>
          {watchProgress && watchProgress > 0 && (
            <div className="text-xs text-red-400 mt-1">
              Просмотрено {Math.round(watchProgress)}%
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
