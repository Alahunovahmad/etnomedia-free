import { prisma } from '../src/lib/prisma'

async function createTestData() {
  try {
    console.log('Creating test data...')
    
    // Create test movies
    const testMovies = [
      {
        title: "Дюна: Часть вторая",
        m3u8Url: "https://test-stream.example.com/dune2.m3u8",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
        description: "Продолжение эпической саги о Поле Атрейдесе",
        year: 2024,
        rating: 8.5,
        genres: "Научная фантастика, Приключения",
        duration: 166
      },
      {
        title: "Оппенгеймер",
        m3u8Url: "https://test-stream.example.com/oppenheimer.m3u8",
        posterUrl: "https://images.unsplash.com/photo-1578915628145-2b790e2c4c2b?w=500&h=750&fit=crop",
        description: "История создания атомной бомбы",
        year: 2023,
        rating: 8.3,
        genres: "Биография, Драма, История",
        duration: 180
      },
      {
        title: "Дөөпараз",
        m3u8Url: "https://api.etnomedia.ru/playlist/3164/82f2938af196187b61792a8edc08f17f/p.m3u8?e=1772366063&apiKey=web_weybg3w3ell",
        posterUrl: "https://etnomedia-cache.cdnvideo.ru/etnomedia/test/videos/2025/21344/images/2342494085.jpg",
        description: "Кыргыз комедия жөнөкөй жигиттин сүйүүсү тууралуу",
        year: 2025,
        rating: 7.5,
        genres: "Комедия",
        duration: 78
      }
    ]
    
    for (const movie of testMovies) {
      try {
        await prisma.movie.create({ data: movie })
        console.log(`✓ Created movie: ${movie.title}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Movie already exists: ${movie.title}`)
        } else {
          console.error(`✗ Error creating movie: ${error.message}`)
        }
      }
    }
    
    // Create test series
    const testSeries = await prisma.series.create({
      data: {
        title: "Тестовый сериал",
        description: "Пример сериала с эпизодами",
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&h=750&fit=crop",
        year: 2024,
        rating: 8.0,
        genres: "Драма, Комедия"
      }
    })
    console.log(`✓ Created series: ${testSeries.title}`)
    
    // Create test episodes
    const testEpisodes = [
      { seriesId: testSeries.id, season: 1, episodeNumber: 1, title: "Пилот", m3u8Url: "https://test-stream.example.com/episode1.m3u8" },
      { seriesId: testSeries.id, season: 1, episodeNumber: 2, title: "Вторая серия", m3u8Url: "https://test-stream.example.com/episode2.m3u8" },
      { seriesId: testSeries.id, season: 2, episodeNumber: 1, title: "Новый сезон", m3u8Url: "https://test-stream.example.com/episode3.m3u8" }
    ]
    
    for (const episode of testEpisodes) {
      try {
        await prisma.episode.create({ data: episode })
        console.log(`✓ Created episode: S${episode.season}E${episode.episodeNumber}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Episode already exists: S${episode.season}E${episode.episodeNumber}`)
        } else {
          console.error(`✗ Error creating episode: ${error.message}`)
        }
      }
    }
    
    console.log('Test data creation completed!')
    
  } catch (error) {
    console.error('Error creating test data:', error)
  }
}

createTestData()
