'use client'

import { useState, useEffect } from 'react'
import HeroCarousel from './HeroCarousel'

interface HeroItem {
  id: number
  title: string
  description: string | null
  rating: number
  year: number
  bgImage: string | null
  posterUrl: string | null
  type: 'movie' | 'series'
}

export default function HeroCarouselWrapper() {
  const [items, setItems] = useState<HeroItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHeroItems = async () => {
      try {
        const response = await fetch('/api/hero')
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error('Error fetching hero items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeroItems()
  }, [])

  if (isLoading) {
    return (
      <section className="relative h-[85vh] min-h-[600px] w-full bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="relative h-[85vh] min-h-[600px] w-full bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-white text-xl">Нет доступных фильмов</div>
        </div>
      </section>
    )
  }

  return <HeroCarousel items={items} />
}
