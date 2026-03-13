'use client'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Play, Plus, Star } from 'lucide-react'

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

interface HeroCarouselProps {
  items: HeroItem[]
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      dragFree: false,
      containScroll: false,
    },
    [Autoplay({ delay: 7000, stopOnInteraction: false })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Динамический фон с crossfade эффектом */}
      <div className="absolute inset-0">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === selectedIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={item.bgImage || item.posterUrl || '/placeholder.jpg'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Embla Carousel */}
      <div className="relative h-full" ref={emblaRef}>
        <div className="flex h-full items-center">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center transition-all duration-500 ease-out ${
                index === selectedIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-40 scale-95 cursor-pointer hover:opacity-60'
              }`}
              onClick={() => index !== selectedIndex && scrollTo(index)}
            >
              {/* Фоновый постер */}
              <div className="absolute inset-0">
                <img
                  src={item.posterUrl || item.bgImage || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
              </div>

              {/* Центрированная карточка с информацией */}
              <div className="relative z-10 w-full h-full flex items-center justify-center px-4 md:px-8">
                <div className="flex items-center justify-center">
                  {/* Стеклянная карточка с постером */}
                  <div className={`backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-4 md:p-6 transition-all duration-500 ${
                    index === selectedIndex 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-40 scale-95 cursor-pointer hover:opacity-60'
                  }`}
                  onClick={() => index !== selectedIndex && scrollTo(index)}
                  >
                    {/* Постер внутри карточки */}
                    <div className="flex justify-center">
                      <img
                        src={item.posterUrl || item.bgImage || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-48 md:w-56 lg:w-64 aspect-[2/3] object-cover rounded-lg shadow-lg"
                      />
                    </div>

                    {/* Название */}
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight text-center mt-4">
                      {item.title}
                    </h1>

                    {/* Рейтинг и год */}
                    <div className="flex items-center justify-center gap-3 text-white/80 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                      <span className="text-white/60">•</span>
                      <span>{item.year}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-xs px-2 py-1 bg-red-600/20 border border-red-600/30 rounded-full">
                        {item.type === 'movie' ? 'Фильм' : 'Сериал'}
                      </span>
                    </div>

                    {/* Кнопки действий - только для активного слайда */}
                    {index === selectedIndex && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center pt-3">
                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-sm">
                          <Play className="w-4 h-4" />
                          Смотреть
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-medium rounded-lg transition-colors text-sm">
                          <Plus className="w-4 h-4" />
                          В закладки
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Кнопки только для мобильных */}
                <div className="md:hidden absolute bottom-8 left-0 right-0">
                  {index === selectedIndex && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
                      <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-sm">
                        <Play className="w-4 h-4" />
                        Смотреть
                      </button>
                      <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-medium rounded-lg transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        В закладки
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки управления */}
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Индикаторы */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-1 transition-all duration-300 backdrop-blur-sm ${
              index === selectedIndex
                ? 'w-8 bg-red-500'
                : 'w-1 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
