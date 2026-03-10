import { prisma } from '../etno-bot/src/lib/prisma'
import fs from 'fs'
import path from 'path'

async function importMovies() {
  try {
    console.log('Starting movies import...')
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', 'etnomedia-export-2026-03-09.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    const movies = jsonData.movies || []
    console.log(`Found ${movies.length} movies to import`)
    
    // Import movies without clearing existing data
    for (const movie of movies) {
      try {
        await prisma.movie.create({
          data: {
            title: movie.title,
            description: movie.description || null,
            posterUrl: movie.poster_url || null,
            m3u8Url: movie.m3u8_url,
            bgImage: movie.bg_image || null,
            year: movie.year || null,
            rating: movie.rating || 0.0,
            duration: movie.duration || null,
            trailerUrl: movie.trailer_url || null,
            actors: movie.actors || null,
            directors: movie.directors || null,
            genres: movie.genres || null,
            addedById: null
          }
        })
        console.log(`✓ Imported movie: ${movie.title}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Movie already exists: ${movie.title}`)
        } else {
          console.error(`✗ Error importing movie ${movie.title}:`, error.message)
        }
      }
    }
    
    console.log(`Movie import completed`)
    
  } catch (error) {
    console.error('Error importing movies:', error)
    throw error
  }
}

async function importSeriesAndEpisodes() {
  try {
    console.log('Starting series and episodes import...')
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', 'etnomedia-export-2026-03-09.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    const series = jsonData.series || []
    console.log(`Found ${series.length} series to import`)
    
    // Clear existing series and episodes
    await prisma.episode.deleteMany({})
    await prisma.series.deleteMany({})
    console.log('Cleared existing series and episodes')
    
    // Import series and episodes
    for (const serie of series) {
      // Create series
      const createdSeries = await prisma.series.create({
        data: {
          title: serie.title,
          description: serie.description || null,
          posterUrl: serie.poster_url || null,
          bgImage: serie.bg_image || null,
          year: serie.year || null,
          rating: serie.rating || 0.0,
          actors: serie.actors || null,
          directors: serie.directors || null,
          genres: serie.genres || null
        }
      })
      console.log(`Imported series: ${serie.title}`)
      
      // Import episodes for this series
      const episodes = serie.episodes || []
      for (const episode of episodes) {
        await prisma.episode.create({
          data: {
            seriesId: createdSeries.id,
            season: episode.season || 1,
            episodeNumber: episode.episode_number,
            title: episode.title || null,
            m3u8Url: episode.m3u8_url,
            duration: episode.duration || null,
            posterUrl: episode.poster_url || null
          }
        })
        console.log(`  - Imported episode S${episode.season}E${episode.episode_number}`)
      }
    }
    
    console.log(`Successfully imported ${series.length} series with episodes`)
    
  } catch (error) {
    console.error('Error importing series and episodes:', error)
    throw error
  }
}

async function main() {
  try {
    await importMovies()
    await importSeriesAndEpisodes()
    console.log('Import completed successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
