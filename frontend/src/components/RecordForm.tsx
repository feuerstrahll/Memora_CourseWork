import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Record, AccessLevel } from '../types'
import { inventoriesApi, keywordsApi } from '../api'

interface RecordFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Record>) => Promise<void>
  record?: Record | null
}

export default function RecordForm({ isOpen, onClose, onSubmit, record }: RecordFormProps) {
  const [inventoryId, setInventoryId] = useState<number>(0)
  const [refCode, setRefCode] = useState('')
  const [title, setTitle] = useState('')
  const [annotation, setAnnotation] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [extent, setExtent] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PUBLIC)
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const { data: inventories } = useQuery({
    queryKey: ['inventories'],
    queryFn: inventoriesApi.getAll,
  })

  const { data: keywords } = useQuery({
    queryKey: ['keywords'],
    queryFn: keywordsApi.getAll,
  })

  useEffect(() => {
    if (record) {
      setInventoryId(record.inventoryId)
      setRefCode(record.refCode)
      setTitle(record.title)
      setAnnotation(record.annotation || '')
      setDateFrom(record.dateFrom ? record.dateFrom.split('T')[0] : '')
      setDateTo(record.dateTo ? record.dateTo.split('T')[0] : '')
      setExtent(record.extent || '')
      setAccessLevel(record.accessLevel)
      setSelectedKeywords(record.keywords?.map((k) => k.id) || [])
    } else {
      setInventoryId(0)
      setRefCode('')
      setTitle('')
      setAnnotation('')
      setDateFrom('')
      setDateTo('')
      setExtent('')
      setAccessLevel(AccessLevel.PUBLIC)
      setSelectedKeywords([])
    }
  }, [record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        inventoryId,
        refCode,
        title,
        annotation: annotation || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        extent: extent || undefined,
        accessLevel,
        keywordIds: selectedKeywords,
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
      title={record ? 'Редактировать единицу хранения' : 'Создать единицу хранения'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Опись *</label>
          <select value={inventoryId} onChange={(e) => setInventoryId(+e.target.value)} required>
            <option value="">Выберите опись</option>
            {inventories?.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.fond?.code} - {inv.number} - {inv.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Шифр *</label>
          <input
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            required
            placeholder="Д-123"
          />
        </div>

        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Название единицы хранения"
          />
        </div>

        <div className="form-group">
          <label>Аннотация</label>
          <textarea
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            placeholder="Краткое описание содержания"
          />
        </div>

        <div className="form-group">
          <label>Дата от</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Дата до</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Объём</label>
          <input
            type="text"
            value={extent}
            onChange={(e) => setExtent(e.target.value)}
            placeholder="50 листов"
          />
        </div>

        <div className="form-group">
          <label>Уровень доступа *</label>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
            required
          >
            <option value={AccessLevel.PUBLIC}>Публичный</option>
            <option value={AccessLevel.RESTRICTED}>Ограниченный</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ключевые слова</label>
          <select
            multiple
            value={selectedKeywords.map(String)}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, (option) => +option.value)
              setSelectedKeywords(values)
            }}
            style={{ minHeight: '100px' }}
          >
            {keywords?.map((keyword) => (
              <option key={keyword.id} value={keyword.id}>
                {keyword.value}
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
            Удерживайте Ctrl для выбора нескольких
          </small>
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

