import { Settings } from 'lucide-react'

export default function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Технические работы
          </h1>
          
          <p className="text-zinc-400 mb-6">
            Сайт временно недоступен. Мы проводим плановое обслуживание системы.
            Пожалуйста, попробуйте зайти позже.
          </p>
          
          <div className="text-sm text-zinc-500">
            Приносим извинения за неудобства
          </div>
        </div>
      </div>
    </div>
  )
}
