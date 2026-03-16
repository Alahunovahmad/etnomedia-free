import { Metadata } from 'next'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AddContentPage from './AddContentPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Добавление контента - ETNOMEDIA',
  description: 'Добавление фильмов и сериалов с обогащением из Etnomedia'
}

export default async function AddContentLayout() {
  const user = await getUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  return <AddContentPage />
}
