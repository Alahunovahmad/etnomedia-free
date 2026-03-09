import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import fs from 'fs'
import path from 'path'

async function importMovies() {
  try {
    console.log('Starting movies import...')
    
    // Read JSON file
    const jsonPath = path.join(process.cwd(), 'etnomedia-export-2026-03-09.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    const movies = jsonData.movies || []
    console.log(`Found ${movies.length} movies to import`)
    
    // Import movies with only required fields
    for (const movie of movies) {
      try {
        await prisma.movie.create({
          data: {
            title: movie.title || 'Без названия',
            m3u8Url: movie.m3u8_url || '',
            description: movie.description || null,
            posterUrl: movie.poster_url || null,
            bgImage: movie.bg_image || null,
            year: movie.year || null,
            rating: movie.rating || null,
            duration: movie.duration ? Math.round(movie.duration) : null,
            trailerUrl: movie.trailer_url || null,
            actors: movie.actors || null,
            directors: movie.directors || null,
            genres: movie.genres || null,
            addedById: null
          }
        })
        console.log(`✓ Imported: ${movie.title}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Already exists: ${movie.title}`)
        } else {
          console.error(`✗ Error: ${movie.title} - ${error.message}`)
        }
      }
    }
    
    console.log('Movie import completed')
    
  } catch (error) {
    console.error('Error importing movies:', error)
  }
}

async function importSeriesAndEpisodes() {
  try {
    console.log('Starting series import...')
    
    // Read JSON file
    const jsonPath = path.join(process.cwd(), 'etnomedia-export-2026-03-09.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    const series = jsonData.series || []
    console.log(`Found ${series.length} series to import`)
    
    // Import series and episodes
    for (const serie of series) {
      try {
        // Create series
        const createdSeries = await prisma.series.create({
          data: {
            title: serie.title || 'Без названия',
            description: serie.description || null,
            posterUrl: serie.poster_url || null,
            bgImage: serie.bg_image || null,
            year: serie.year || null,
            rating: serie.rating || null,
            actors: serie.actors || null,
            directors: serie.directors || null,
            genres: serie.genres || null
          }
        })
        console.log(`✓ Imported series: ${serie.title}`)
        
        // Import episodes
        const episodes = serie.episodes || []
        for (const episode of episodes) {
          try {
            await prisma.episode.create({
              data: {
                seriesId: createdSeries.id,
                season: episode.season || 1,
                episodeNumber: episode.episode_number || 1,
                title: episode.title || `Серия ${episode.episode_number}`,
                m3u8Url: episode.m3u8_url || ''
              }
            })
            console.log(`  ✓ Episode S${episode.season}E${episode.episode_number}`)
          } catch (episodeError: any) {
            if (episodeError.code === 'P2002') {
              console.log(`  ⚠ Episode already exists`)
            } else {
              console.error(`  ✗ Episode error: ${episodeError.message}`)
            }
          }
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠ Series already exists: ${serie.title}`)
        } else {
          console.error(`✗ Series error: ${serie.title} - ${error.message}`)
        }
      }
    }
    
    console.log('Series import completed')
    
  } catch (error) {
    console.error('Error importing series:', error)
  }
}

async function main() {
  try {
    await importMovies()
    await importSeriesAndEpisodes()
    console.log('Import completed!')
  } catch (error) {
    console.error('Import failed:', error)
  }
}

main()
