import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Inventory } from '../types'
import { fondsApi } from '../api'

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Inventory>) => Promise<void>
  inventory?: Inventory | null
}

export default function InventoryForm({ isOpen, onClose, onSubmit, inventory }: InventoryFormProps) {
  const [fondId, setFondId] = useState<number>(0)
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: fonds } = useQuery({
    queryKey: ['fonds'],
    queryFn: fondsApi.getAll,
  })

  useEffect(() => {
    if (inventory) {
      setFondId(inventory.fondId)
      setNumber(inventory.number)
      setTitle(inventory.title)
    } else {
      setFondId(0)
      setNumber('')
      setTitle('')
    }
  }, [inventory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        fondId,
        number,
        title,
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={inventory ? 'Редактировать опись' : 'Создать опись'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Фонд *</label>
          <select 
            value={fondId} 
            onChange={(e) => setFondId(+e.target.value)} 
            required
          >
            <option value={0}>Выберите фонд</option>
            {fonds?.map((fond) => (
              <option key={fond.id} value={fond.id}>
                {fond.code} - {fond.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Номер описи *</label>
          <input
            type="text"
            value={number}
            onChange={(e) => {
              const value = e.target.value
              // Блокируем ввод минуса
              if (!value.startsWith('-')) {
                // Разрешаем только цифры
                if (value === '' || /^\d+$/.test(value)) {
                  setNumber(value)
                }
              }
            }}
            onBlur={(e) => {
              // При потере фокуса проверяем, что число не отрицательное и не ноль
              const value = e.target.value.trim()
              if (value) {
                const num = parseInt(value)
                if (isNaN(num) || num < 1) {
                  setNumber('')
                }
              }
            }}
            min="1"
            required
            placeholder="1"
            pattern="[1-9]\d*"
            title="Введите положительное число (начиная с 1)"
          />
        </div>

        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Название описи"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

