import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SeasonData {
  number: number
  episodes: EpisodeData[]
}

interface EpisodeData {
  number: number
  title: string
  description?: string
  m3u8Url: string
  duration?: number
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const {
            title,
            description,
            poster_url,
            bg_image,
            year,
            rating,
            duration,
            trailer_url,
            actors,
            directors,
            genres,
            type,
            m3u8Url,
            seasons
        } = data

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        if (!type || !['movie', 'series'].includes(type)) {
            return NextResponse.json({ error: 'Valid type (movie/series) is required' }, { status: 400 })
        }

        // Проверяем, не существует ли уже такой контент
        const existingContent = type === 'movie' 
            ? await prisma.movie.findFirst({ where: { title } })
            : await prisma.series.findFirst({ where: { title } })

        if (existingContent) {
            return NextResponse.json({ 
                error: `${type === 'movie' ? 'Фильм' : 'Сериал'} с таким названием уже существует` 
            }, { status: 409 })
        }

        // Создаем запись в базе данных
        if (type === 'movie') {
            await prisma.movie.create({
                data: {
                    title,
                    description,
                    posterUrl: poster_url,
                    m3u8Url: m3u8Url || '',
                    bgImage: bg_image,
                    year: year ? parseInt(year.toString()) : null,
                    rating: rating ? parseFloat(rating.toString()) : null,
                    duration: duration ? parseInt(duration.toString()) : null,
                    trailerUrl: trailer_url,
                    actors,
                    directors,
                    genres
                }
            })
        } else if (type === 'series') {
            // Создаем сериал
            const series = await prisma.series.create({
                data: {
                    title,
                    description,
                    posterUrl: poster_url,
                    bgImage: bg_image,
                    year: year ? parseInt(year.toString()) : null,
                    rating: rating ? parseFloat(rating.toString()) : null,
                    actors,
                    directors,
                    genres
                }
            })

            // Создаем эпизоды если они есть
            if (seasons && Array.isArray(seasons)) {
                for (const season of seasons) {
                    // Создаем эпизоды для сезона
                    if (season.episodes && Array.isArray(season.episodes)) {
                        for (const episode of season.episodes) {
                            await prisma.episode.create({
                                data: {
                                    seriesId: series.id,
                                    season: season.number,
                                    episodeNumber: episode.number,
                                    title: episode.title,
                                    m3u8Url: episode.m3u8Url,
                                    duration: episode.duration || null
                                }
                            })
                        }
                    }
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${type === 'movie' ? 'Фильм' : 'Сериал'} успешно добавлен` 
        })

    } catch (error) {
        console.error('Add content error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
