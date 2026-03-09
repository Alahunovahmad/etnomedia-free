import MovieCard from '@/components/shared/MovieCard'
import SeriesCard from '@/components/shared/SeriesCard'
import MaintenanceMode from '@/components/MaintenanceMode'
import { WatchProgressProvider, useWatchProgress } from '@/components/shared/WatchProgressProvider'
import { Movie } from '@/types'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'
import { useEffect } from 'react'

// Mock data for testing
const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Дюна: Часть вторая",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
    rating: 8.5,
    year: 2024,
    genres: "Научная фантастика, Приключения",
    description: "Продолжение эпической саги о Поле Атрейдесе",
    m3u8Url: "https://test-stream.example.com/dune2.m3u8",
    bgImage: null,
    duration: 166,
    trailerUrl: null,
    actors: "Тимоти Шаламе, Зендая, Рейнальдо Маркус",
    directors: "Дени Вильнёв",
    createdAt: new Date(),
    updatedAt: new Date(),
    addedById: null
  },
  {
    id: 2,
    title: "Оппенгеймер",
    posterUrl: "https://images.unsplash.com/photo-1578915628145-2b790e2c4c2b?w=500&h=750&fit=crop",
    rating: 8.3,
    year: 2023,
    genres: "Биография, Драма, История",
    description: "История создания атомной бомбы",
    m3u8Url: "https://test-stream.example.com/oppenheimer.m3u8",
    bgImage: null,
    duration: 180,
    trailerUrl: null,
    actors: "Киллиан Мёрфи, Эмили Блант, Роберт Дауни-младший",
    directors: "Кристофер Нолан",
    createdAt: new Date(),
    updatedAt: new Date(),
    addedById: null
  },
  {
    id: 3,
    title: "Дөөпараз",
    posterUrl: "https://etnomedia-cache.cdnvideo.ru/etnomedia/test/videos/2025/21344/images/2342494085.jpg",
    rating: 7.5,
    year: 2025,
    genres: "Комедия",
    description: "Кыргыз комедия жөнөкөй жигиттин сүйүүсү тууралуу",
    m3u8Url: "https://api.etnomedia.ru/playlist/3164/82f2938af196187b61792a8edc08f17f/p.m3u8?e=1772366063&apiKey=web_weybg3w3ell",
    bgImage: null,
    duration: 78,
    trailerUrl: "https://etnomedia-cache.cdnvideo.ru/etnomedia/videos/2025/21344/trailers/6433092306.mp4",
    actors: "Болот Тентимышов, Эмил Токтошев",
    directors: "Нурланбек Камчыбеков",
    createdAt: new Date(),
    updatedAt: new Date(),
    addedById: null
  }
]

function HomePageClient({ movies, series }: { movies: Movie[], series: any[] }) {
  const { progress, loadProgress } = useWatchProgress()

  useEffect(() => {
    // Загружаем прогресс для всех фильмов
    const movieIds = movies.map(movie => movie.id)
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
          {movies.map((movie) => (
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
            {series.map((item) => (
              <SeriesCard key={item.id} series={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default async function HomePage() {
  // Проверка режима обслуживания
  const maintenanceMode = await isMaintenanceMode()
  const user = await getUser()
  
  // Показываем страницу обслуживания всем, кроме админов
  if (maintenanceMode && (!user || user.role !== 'ADMIN')) {
    return <MaintenanceMode />
  }

  // Try to get movies from database, fallback to mock data
  let movies: Movie[] = MOCK_MOVIES
  let series: any[] = []
  
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // Get top rated movies
    const dbMovies = await prisma.movie.findMany({
      where: {
        rating: { not: null }
      },
      orderBy: { rating: 'desc' },
      take: 12
    })
    if (dbMovies.length > 0) {
      movies = dbMovies
    }
    
    // Get top rated series
    series = await prisma.series.findMany({
      where: {
        rating: { not: null }
      },
      orderBy: { rating: 'desc' },
      take: 12
    })
  } catch (error) {
    console.log('Database not available, using mock data')
  }

  return (
    <WatchProgressProvider>
      <HomePageClient movies={movies} series={series} />
    </WatchProgressProvider>
  )
}
