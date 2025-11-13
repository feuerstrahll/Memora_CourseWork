import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from './Modal'
import { Request, RequestType, Record } from '../types'
import { recordsApi } from '../api'

interface RequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { recordId: number; type: RequestType }) => Promise<void>
  request?: Request | null
  preselectedRecordId?: number
}

export default function RequestForm({
  isOpen,
  onClose,
  onSubmit,
  request,
  preselectedRecordId,
}: RequestFormProps) {
  const [recordId, setRecordId] = useState<number>(0)
  const [type, setType] = useState<RequestType>(RequestType.VIEW)
  const [loading, setLoading] = useState(false)

  const { data: records } = useQuery({
    queryKey: ['records'],
    queryFn: recordsApi.getAll,
    enabled: !preselectedRecordId, // Only fetch if no preselected record
  })

  useEffect(() => {
    if (request) {
      setRecordId(request.recordId)
      setType(request.type)
    } else if (preselectedRecordId) {
      setRecordId(preselectedRecordId)
      setType(RequestType.VIEW)
    } else {
      setRecordId(0)
      setType(RequestType.VIEW)
    }
  }, [request, preselectedRecordId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordId) return

    setLoading(true)
    try {
      await onSubmit({
        recordId,
        type,
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
      title={request ? 'Редактировать заявку' : 'Подать заявку'}
    >
      <form onSubmit={handleSubmit}>
        {!preselectedRecordId && (
          <div className="form-group">
            <label>Единица хранения *</label>
            <select value={recordId} onChange={(e) => setRecordId(+e.target.value)} required>
              <option value={0}>Выберите единицу хранения</option>
              {records?.map((record: Record) => (
                <option key={record.id} value={record.id}>
                  {record.refCode} - {record.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {preselectedRecordId && (
          <div className="form-group">
            <p>
              <strong>Единица хранения:</strong> выбрана из таблицы
            </p>
          </div>
        )}

        <div className="form-group">
          <label>Тип заявки *</label>
          <select value={type} onChange={(e) => setType(e.target.value as RequestType)} required>
            <option value={RequestType.VIEW}>Просмотр в читальном зале</option>
            <option value={RequestType.SCAN}>Запрос на сканирование</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn-primary" disabled={loading || !recordId}>
            {loading ? 'Отправка...' : 'Подать заявку'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

