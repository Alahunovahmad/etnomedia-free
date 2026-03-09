import { Play } from 'lucide-react'
import Link from 'next/link'

interface Series {
  id: number
  title: string
  posterUrl: string | null
  rating: number | null
  year: number | null
  genres: string | null
}

interface SeriesCardProps {
  series: Series
}

export default function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link href={`/series/${series.id}`} className="block group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <img
          src={series.posterUrl || '/placeholder-movie.jpg'}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with play button */}
        <div className="movie-card-overlay">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Play className="h-5 w-5" />
            <span>Смотреть</span>
          </button>
        </div>
        
        {/* Series info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
            {series.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{series.year || 'N/A'}</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span>{series.rating || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
