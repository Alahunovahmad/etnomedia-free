import { Metadata } from 'next'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ContentManagementPage from './ContentManagementPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Управление контентом - ETNOMEDIA',
  description: 'Управление фильмами и сериалами'
}

export default async function ContentManagementLayout() {
  const user = await getUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  return <ContentManagementPage />
}
