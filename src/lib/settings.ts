import { prisma } from './prisma'

export async function getSettings() {
  try {
    const settings = await prisma.settings.findMany()
    
    const settingsObj = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
    
    return settingsObj
  } catch (error) {
    console.error('Failed to load settings:', error)
    return {}
  }
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key }
    })
    
    return setting?.value || defaultValue
  } catch (error) {
    console.error(`Failed to load setting ${key}:`, error)
    return defaultValue
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  const value = await getSetting('maintenanceMode', 'false')
  return value === 'true'
}

export async function isRegistrationEnabled(): Promise<boolean> {
  const value = await getSetting('enableRegistration', 'true')
  return value === 'true'
}
