import { cookies } from 'next/headers'

export async function getServerSession(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('etnomedia_session')?.value
  } catch (error) {
    return undefined
  }
}
