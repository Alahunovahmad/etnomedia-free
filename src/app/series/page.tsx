import SeriesCard from '@/components/shared/SeriesCard'
import { prisma } from '@/lib/prisma'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'
import MaintenanceMode from '@/components/MaintenanceMode'
import { Series } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SeriesPage() {
  // Проверка режима обслуживания
  const maintenanceMode = await isMaintenanceMode()
  const user = await getUser()
  
  if (maintenanceMode && (!user || user.role !== 'ADMIN')) {
    return <MaintenanceMode />
  }

  const series = await prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      posterUrl: true,
      rating: true,
      year: true,
      genres: true,
      actors: true,
      directors: true,
      bgImage: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Все сериалы</h1>
        
        {series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Сериалы не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {series.map((item: any) => (
              <SeriesCard key={item.id} series={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
