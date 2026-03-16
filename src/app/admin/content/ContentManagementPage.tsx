'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ContentManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление контентом
        </h1>
        <p className="text-gray-600">
          Управление фильмами и сериалами
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Фильмы</h2>
          <p className="text-gray-600 mb-4">
            Управление фильмами в базе данных
          </p>
          <button
            onClick={() => router.push('/admin/movies')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Управлять фильмами
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Сериалы</h2>
          <p className="text-gray-600 mb-4">
            Управление сериалами в базе данных
          </p>
          <button
            onClick={() => router.push('/admin/series')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Управлять сериалами
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Добавить контент</h2>
          <p className="text-gray-600 mb-4">
            Добавить новый фильм или сериал
          </p>
          <button
            onClick={() => router.push('/admin/add-content')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
          >
            Добавить контент
          </button>
        </div>
      </div>
    </div>
  )
}
