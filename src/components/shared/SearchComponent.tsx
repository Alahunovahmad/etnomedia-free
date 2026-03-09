'use client'

import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  type: 'movie' | 'series'
  posterUrl?: string
  year?: number
}

export default function SearchComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const searchContent = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchContent, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex])
      } else if (query.trim().length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setIsOpen(false)
      }
    }
  }

  const handleResultClick = (result: SearchResult) => {
    const url = result.type === 'movie' ? `/movie/${result.id}` : `/series/${result.id}`
    router.push(url)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const handleSearchClick = () => {
    setIsOpen(true)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <button 
        onClick={handleSearchClick}
        className="text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800"
        title="Поиск"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 border border-gray-800">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Поиск фильмов и сериалов..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-400"
                />
                {query && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  Поиск...
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        index === selectedIndex 
                          ? 'bg-gray-800 border border-red-600' 
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {result.posterUrl ? (
                          <img 
                            src={result.posterUrl} 
                            alt={result.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center">
                            <Search className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{result.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className="capitalize">{result.type === 'movie' ? 'Фильм' : 'Сериал'}</span>
                            {result.year && (
                              <>
                                <span>•</span>
                                <span>{result.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Ничего не найдено</p>
                  <p className="text-sm mt-2">Попробуйте изменить поисковый запрос</p>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Введите минимум 2 символа для поиска</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {query.trim().length >= 2 && (
              <div className="p-3 border-t border-gray-800">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                    setIsOpen(false)
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Показать все результаты
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
