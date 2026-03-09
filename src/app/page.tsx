import MaintenanceMode from '@/components/MaintenanceMode'
import { WatchProgressProvider } from '@/components/shared/WatchProgressProvider'
import HomePageClient from '@/components/HomePageClient'
import { Movie } from '@/types'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
