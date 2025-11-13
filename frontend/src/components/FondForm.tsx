import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Fond } from '../types'

interface FondFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Fond>) => Promise<void>
  fond?: Fond | null
}

export default function FondForm({ isOpen, onClose, onSubmit, fond }: FondFormProps) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverageDates, setCoverageDates] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (fond) {
      setCode(fond.code)
      setTitle(fond.title)
      setDescription(fond.description || '')
      setCoverageDates(fond.coverageDates || '')
    } else {
      setCode('')
      setTitle('')
      setDescription('')
      setCoverageDates('')
    }
  }, [fond])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        code,
        title,
        description: description || undefined,
        coverageDates: coverageDates || undefined,
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fond ? 'Редактировать фонд' : 'Создать фонд'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Код фонда *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Ф-1"
          />
        </div>

        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Название фонда"
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание фонда"
          />
        </div>

        <div className="form-group">
          <label>Хронология</label>
          <input
            type="text"
            value={coverageDates}
            onChange={(e) => setCoverageDates(e.target.value)}
            placeholder="1920-1945"
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

