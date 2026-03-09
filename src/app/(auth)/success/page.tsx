import { Suspense } from 'react'
import SuccessPageContent from './SuccessPageContent'

export const dynamic = 'force-dynamic'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Загрузка...</div></div>}>
      <SuccessPageContent />
    </Suspense>
  )
}
