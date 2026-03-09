'use client'

import { useState, useEffect } from 'react'
import { Settings, Database, Bot, Shield, Save, RefreshCw } from 'lucide-react'

interface SystemSettings {
  siteName: string
  siteDescription: string
  maxFavorites: string
  enableRegistration: string
  maintenanceMode: string
  telegramBotToken: string
  apiRateLimit: string
  yandexMetrikaEnabled: string
  yandexMetrikaId: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'ETNOMEDIA',
    siteDescription: 'Онлайн-кинотеатр',
    maxFavorites: '100',
    enableRegistration: 'true',
    maintenanceMode: 'false',
    telegramBotToken: '',
    apiRateLimit: '100',
    yandexMetrikaEnabled: 'false',
    yandexMetrikaId: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: String(value)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Настройки сохранены')
      } else {
        alert('Ошибка при сохранении настроек')
      }
    } catch (error) {
      alert('Ошибка при сохранении настроек')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCache = async () => {
    if (!confirm('Вы уверены, что хотите очистить кэш?')) {
      return
    }

    setIsClearingCache(true)
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST'
      })

      if (response.ok) {
        alert('Кэш очищен')
      } else {
        alert('Ошибка при очистке кэша')
      }
    } catch (error) {
      alert('Ошибка при очистке кэша')
    } finally {
      setIsClearingCache(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Настройки</h1>
          <p className="text-zinc-400">Управление системными настройками</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Общие настройки */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Общие настройки</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Название сайта
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Описание сайта
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Максимум избранного
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={settings.maxFavorites}
                onChange={(e) => handleSettingChange('maxFavorites', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Системные настройки */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Системные настройки</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Регистрация пользователей
                </label>
                <p className="text-zinc-500 text-xs">Разрешить регистрацию новых пользователей</p>
              </div>
              <button
                onClick={() => handleSettingChange('enableRegistration', settings.enableRegistration === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableRegistration === 'true' ? 'bg-red-600' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableRegistration === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Режим обслуживания
                </label>
                <p className="text-zinc-500 text-xs">Отключить сайт для пользователей</p>
              </div>
              <button
                onClick={() => handleSettingChange('maintenanceMode', settings.maintenanceMode === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode === 'true' ? 'bg-red-600' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Лимит API запросов (в минуту)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={settings.apiRateLimit}
                onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Интеграции */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Интеграции</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Яндекс.Метрика
                </label>
                <p className="text-zinc-500 text-xs">Включить отслеживание посещений</p>
              </div>
              <button
                onClick={() => handleSettingChange('yandexMetrikaEnabled', settings.yandexMetrikaEnabled === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.yandexMetrikaEnabled === 'true' ? 'bg-red-600' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.yandexMetrikaEnabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                ID счетчика Яндекс.Метрики
              </label>
              <input
                type="text"
                value={settings.yandexMetrikaId}
                onChange={(e) => handleSettingChange('yandexMetrikaId', e.target.value)}
                placeholder="12345678"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-zinc-500 text-xs mt-1">
                Укажите ID вашего счетчика в Яндекс.Метрике
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={settings.telegramBotToken}
                onChange={(e) => handleSettingChange('telegramBotToken', e.target.value)}
                placeholder="Токен Telegram бота"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Управление системой */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-white">Управление системой</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isClearingCache ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Очистка кэша...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Очистить кэш
                </>
              )}
            </button>

            <div className="text-zinc-400 text-sm">
              <p>• Очистка кэша обновит все статические файлы</p>
              <p>• Сбросит кэш базы данных</p>
              <p>• Обновит метаданные</p>
            </div>
          </div>
        </div>
      </div>

      {/* Сохранение */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Сохранить настройки
            </>
          )}
        </button>
      </div>
    </div>
  )
}
