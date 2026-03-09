import { Suspense } from 'react'
import ManualAuthContent from './ManualAuthContent'

export const dynamic = 'force-dynamic'

export default function ManualAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Загрузка...</div></div>}>
      <ManualAuthContent />
    </Suspense>
  )
}
