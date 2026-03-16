import { NextResponse } from 'next/server'
import axios from 'axios'

const API_KEY = 'web_weybg3w3ell'

async function fetchMovieData(movieTitle: string, type: 'movie' | 'series' = 'movie') {
    try {
        console.log(`Fetching data for: ${movieTitle}`)
        
        // 1. Search for ID
        const searchUrl = `https://api.etnomedia.ru/search?q=${encodeURIComponent(movieTitle)}&apikey=${API_KEY}`
        const searchRes = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://etnomedia.tv/'
            }
        })

        if (!searchRes.data || !searchRes.data.results || searchRes.data.results.length === 0) {
            console.log(`No results found for ${movieTitle}`)
            return null
        }

        // Ищем результат соответствующего типа
        const result = searchRes.data.results.find((item: any) => {
            if (type === 'movie') {
                return item.type === 'movie' || (!item.type && !item.seasons)
            }
            return item.type === 'series' || item.seasons
        })

        if (!result) {
            console.log(`No ${type} results found for ${movieTitle}`)
            return null
        }

        const id = result.id
        console.log(`Found ID for ${movieTitle}: ${id}`)

        // 2. Fetch HTML page
        const watchUrl = `https://etnomedia.tv/watch/${id}`
        const watchRes = await axios.get(watchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        })

        // 3. Extract JSON
        const scriptContent = watchRes.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)?.[1]

        if (!scriptContent) {
            console.log(`No __NEXT_DATA__ script found for ${movieTitle}`)
            return null
        }

        const jsonData = JSON.parse(scriptContent)
        const video = jsonData.props?.pageProps?.video

        if (!video) {
            console.log(`No video prop in JSON for ${movieTitle}`)
            return null
        }

        // 4. Map the data
        return {
            title: video.title || movieTitle,
            description: video.description || '',
            poster_url: video.poster || null,
            bg_image: video.bgImage || null,
            year: video.year || null,
            rating: video.ratingEtnomedia || null,
            duration: video.duration || null,
            trailer_url: video.trailer ? video.trailer.url : null,
            actors: video.persons?.actors ? video.persons.actors.map((a: any) => a.name).join(', ') : '',
            directors: video.persons?.directors ? video.persons.directors.map((d: any) => d.name).join(', ') : '',
            genres: video.genres ? video.genres.map((g: any) => g.name).join(', ') : ''
        }

    } catch (error) {
        console.error(`Error querying ${movieTitle}:`, error)
        return null
    }
}

export async function POST(request: Request) {
    try {
        const { title, type } = await request.json()

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const data = await fetchMovieData(title, type)

        if (!data) {
            return NextResponse.json({ error: 'Content not found in Etnomedia' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Etnomedia search error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
