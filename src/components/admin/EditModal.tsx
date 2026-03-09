'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialData: any
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'url'
    required?: boolean
    placeholder?: string
  }>
  onSave: (data: any) => Promise<{ success: boolean; error?: string }>
}

export default function EditModal({
  isOpen,
  onClose,
  title,
  initialData,
  fields,
  onSave
}: EditModalProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData)
      setErrors({})
    }
  }, [isOpen, initialData])

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      const result = await onSave(formData)
      
      if (result.success) {
        onClose()
        // Можно добавить callback для обновления данных
        window.location.reload()
      } else {
        setErrors({ general: result.error || 'Ошибка при сохранении' })
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка. Попробуйте еще раз.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                      errors[field.name] ? 'border-red-500' : 'border-zinc-700'
                    }`}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors[field.name] ? 'border-red-500' : 'border-zinc-700'
                    }`}
                    placeholder={field.placeholder}
                    required={field.required}
                    min={field.type === 'number' ? '0' : undefined}
                    max={field.type === 'number' && field.name === 'rating' ? '10' : undefined}
                    step={field.type === 'number' && field.name === 'rating' ? '0.1' : undefined}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Отмена
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
