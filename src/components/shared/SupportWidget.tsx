'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface Category {
  key: string
  label: string
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    // Загружаем категории
    fetch('/api/support')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !message.trim()) {
      setStatus('error')
      setStatusMessage('Заполните все поля')
      return
    }

    if (message.trim().length < 10) {
      setStatus('error')
      setStatusMessage('Сообщение должно содержать минимум 10 символов')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          message: message.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setStatusMessage(data.message || 'Сообщение отправлено!')
        
        // Сбрасываем форму
        setCategory('')
        setMessage('')
        
        // Закрываем через 3 секунды
        setTimeout(() => {
          setIsOpen(false)
          setStatus('idle')
          setStatusMessage('')
        }, 3000)
      } else {
        setStatus('error')
        setStatusMessage(data.error || 'Ошибка при отправке')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false)
      setStatus('idle')
      setStatusMessage('')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Кнопка виджета */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Модальное окно */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-96 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-white font-semibold">Поддержка</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Контент */}
          <div className="p-4">
            {status === 'success' && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-500 text-sm">{statusMessage}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{statusMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Категория проблемы
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Сообщение */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Опишите проблему
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  placeholder="Подробно опишите вашу проблему или вопрос..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-50"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Минимум 10 символов
                </p>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={loading || !category || !message.trim() || message.trim().length < 10}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Отправить
                  </>
                )}
              </button>
            </form>

            {/* Информация */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-xs">
                💬 Ваше сообщение будет отправлено всем администраторам. 
                Мы постараемся ответить как можно скорее.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
