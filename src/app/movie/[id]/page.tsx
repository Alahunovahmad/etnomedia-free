import { notFound, redirect } from 'next/navigation'
import CustomVideoPlayer from '@/components/player/CustomVideoPlayer'
import { getServerSession } from '@/lib/server-session'
import { getUser } from '@/lib/auth'
import { isMaintenanceMode } from '@/lib/settings'
import MaintenanceMode from '@/components/MaintenanceMode'

export const dynamic = 'force-dynamic'

interface MoviePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MoviePage({ params }: MoviePageProps) {
  // Проверка авторизации
  const user = await getUser()
  
  if (!user) {
    redirect('/login?redirect=/movie/' + (await params).id)
  }

  // Проверка режима обслуживания (админы могут смотреть)
  const maintenanceMode = await isMaintenanceMode()
  if (maintenanceMode && user.role !== 'ADMIN') {
    return <MaintenanceMode />
  }

  const resolvedParams = await params
  let movie = null
  let watchHistory = null
  
  try {
    const { prisma } = await import('@/lib/prisma')
    movie = await prisma.movie.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    })
  } catch (error) {
    console.log('Database not available')
  }

  // Получаем прогресс просмотра
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/watch-history?movieId=${resolvedParams.id}`, {
      headers: {
        'Cookie': `etnomedia_session=${await getServerSession()}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      watchHistory = data.watchHistory
    }
  } catch (error) {
    console.log('Could not fetch watch history')
  }

  // Fallback movie data for testing
  if (!movie) {
    const fallbackMovies = {
      1: {
        id: 1,
        title: "Дюна: Часть вторая",
        description: "Продолжение эпической саги о Поле Атрейдесе. Пол объединяется с Фremenами в попытке отомстить за семью и продолжить миссию своего отца по спасению галактики.",
        m3u8Url: "https://test-stream.example.com/dune2.m3u8",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
        bgImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
        year: 2024,
        rating: 8.5,
        duration: 166,
        trailerUrl: null,
        actors: "Тимоти Шаламе, Зендая, Рейнальдо Маркус, Остин Батлер, Флоренс Пью",
        directors: "Дени Вильнёв",
        genres: "Научная фантастика, Приключения"
      },
      2: {
        id: 2,
        title: "Оппенгеймер",
        description: "История американского учёного Дж. Роберта Оппенгеймера и его роли в разработке атомной бомбы во время Второй мировой войны.",
        m3u8Url: "https://test-stream.example.com/oppenheimer.m3u8",
        posterUrl: "https://images.unsplash.com/photo-1578915628145-2b790e2c4c2b?w=500&h=750&fit=crop",
        bgImage: "https://images.unsplash.com/photo-1578915628145-2b790e2c4c2b?w=1920&h=1080&fit=crop",
        year: 2023,
        rating: 8.3,
        duration: 180,
        trailerUrl: null,
        actors: "Киллиан Мёрфи, Эмили Блант, Роберт Дауни-младший, Мэтт Дэймон",
        directors: "Кристофер Нолан",
        genres: "Биография, Драма, История"
      },
      3: {
        id: 3,
        title: "Дөөпараз",
        description: "Кино көрүп, iPhone 16pro утуп алыңыз! Жаш жигит Дөөпараздын арманы — атак эмес, сүйүү жана үй-бүлө. Бишкекке көчүп келген соң, ал күлкүлүү жана кооптуу окуяларга аралашат.",
        m3u8Url: "https://api.etnomedia.ru/playlist/3164/82f2938af196187b61792a8edc08f17f/p.m3u8?e=1772366063&apiKey=web_weybg3w3ell",
        posterUrl: "https://etnomedia-cache.cdnvideo.ru/etnomedia/test/videos/2025/21344/images/2342494085.jpg",
        bgImage: null,
        year: 2025,
        rating: 7.5,
        duration: 78,
        trailerUrl: "https://etnomedia-cache.cdnvideo.ru/etnomedia/videos/2025/21344/trailers/6433092306.mp4",
        actors: "Болот Тентимышов, Эмил Токтошев, Баяман Сатыбалды уулу, Жазгүл Салидинова",
        directors: "Нурланбек Камчыбеков",
        genres: "Комедия"
      }
    }
    
    movie = fallbackMovies[resolvedParams.id as unknown as keyof typeof fallbackMovies]
    
    if (!movie) {
      notFound()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player */}
        <div className="mb-8">
          <CustomVideoPlayer 
            videoUrl={movie.m3u8Url} 
            posterUrl={movie.posterUrl || undefined}
            movieId={movie.id}
            initialTime={watchHistory?.timecode || 0}
          />
        </div>

        {/* Movie Info */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            
            {movie.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Описание</h2>
                <p className="text-gray-300">{movie.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {movie.year && (
                <div>
                  <span className="text-gray-400">Год:</span>
                  <span className="ml-2">{movie.year}</span>
                </div>
              )}
              
              {movie.rating && (
                <div>
                  <span className="text-gray-400">Рейтинг:</span>
                  <span className="ml-2 text-yellow-400">★ {movie.rating}</span>
                </div>
              )}
              
              {movie.duration && (
                <div>
                  <span className="text-gray-400">Длительность:</span>
                  <span className="ml-2">{movie.duration} мин</span>
                </div>
              )}
            </div>

            {(movie.actors || movie.directors || movie.genres) && (
              <div className="space-y-4">
                {movie.actors && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Актеры</h3>
                    <p className="text-gray-300">{movie.actors}</p>
                  </div>
                )}
                
                {movie.directors && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Режиссеры</h3>
                    <p className="text-gray-300">{movie.directors}</p>
                  </div>
                )}
                
                {movie.genres && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Жанры</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.split(',').map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-red-600 rounded-full text-sm"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {movie.trailerUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Трейлер</h3>
                <a 
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Смотреть трейлер
                </a>
              </div>
            )}
            
            {movie.bgImage && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Фон</h3>
                <img 
                  src={movie.bgImage} 
                  alt="Movie background"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
