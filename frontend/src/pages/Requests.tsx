import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { requestsApi, recordsApi } from '../api'
import { Request, Role, RequestStatus, RequestType } from '../types'
import RequestForm from '../components/RequestForm'
import Modal from '../components/Modal'
import './TablePage.css'

export default function Requests() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: requestsApi.getAll,
    refetchOnWindowFocus: true, // Обновлять данные при возврате фокуса на окно
    refetchOnMount: true, // Обновлять данные при монтировании компонента
  })

  const createMutation = useMutation({
    mutationFn: requestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast('Заявка успешно создана', 'success')
    },
    onError: () => {
      showToast('Ошибка при создании заявки', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: number; status: RequestStatus; rejectionReason?: string }) =>
      requestsApi.update(id, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast('Статус заявки обновлён', 'success')
    },
    onError: () => {
      showToast('Ошибка при обновлении заявки', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: requestsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast('Заявка удалена', 'success')
    },
    onError: () => {
      showToast('Ошибка при удалении заявки', 'error')
    },
  })

  const handleRequestSubmit = async (data: { recordId: number; type: RequestType }) => {
    await createMutation.mutateAsync(data)
    setIsFormOpen(false)
  }

  const handleApprove = (requestId: number) => {
    updateMutation.mutate({
      id: requestId,
      status: RequestStatus.APPROVED,
    })
  }

  const handleOpenRejectModal = (requestId: number) => {
    setRejectingRequestId(requestId)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleReject = () => {
    if (!rejectingRequestId) return
    if (!rejectionReason.trim()) {
      showToast('Укажите причину отклонения', 'error')
      return
    }
    updateMutation.mutate({
      id: rejectingRequestId,
      status: RequestStatus.REJECTED,
      rejectionReason: rejectionReason.trim(),
    })
    setRejectModalOpen(false)
    setRejectingRequestId(null)
    setRejectionReason('')
  }

  const handleComplete = (requestId: number) => {
    updateMutation.mutate({
      id: requestId,
      status: RequestStatus.COMPLETED,
    })
  }

  const getStatusBadge = (status: RequestStatus) => {
    const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
      [RequestStatus.NEW]: { label: '🆕 Новая', color: '#1976d2', bg: '#e3f2fd' },
      [RequestStatus.IN_PROGRESS]: { label: '⏳ В работе', color: '#ed6c02', bg: '#fff4e5' },
      [RequestStatus.APPROVED]: { label: '✅ Одобрена', color: '#2e7d32', bg: '#edf7ed' },
      [RequestStatus.REJECTED]: { label: '❌ Отклонена', color: '#d32f2f', bg: '#fdeded' },
      [RequestStatus.COMPLETED]: { label: '📦 Выполнена', color: '#9c27b0', bg: '#f3e5f5' },
    }
    const config = statusConfig[status]
    return (
      <span style={{ 
        color: config.color, 
        backgroundColor: config.bg,
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 500,
        fontSize: '0.85rem'
      }}>
        {config.label}
      </span>
    )
  }

  const canManage = user?.role === Role.ADMIN || user?.role === Role.ARCHIVIST
  const isResearcher = user?.role === Role.RESEARCHER

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Заявки</h1>
        {isResearcher && (
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            Создать заявку
          </button>
        )}
      </div>

      <RequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleRequestSubmit}
      />

      {/* Модальное окно для отклонения */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Отклонение заявки"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            <strong>Причина отклонения:</strong>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Укажите причину отклонения заявки..."
              style={{
                width: '100%',
                minHeight: '100px',
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'vertical'
              }}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              className="btn-secondary"
              onClick={() => setRejectModalOpen(false)}
              style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Отмена
            </button>
            <button
              className="btn-danger"
              onClick={handleReject}
              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Отклонить
            </button>
          </div>
        </div>
      </Modal>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Единица хранения</th>
              <th>Тип доступа</th>
              <th>Статус</th>
              <th>Заявитель</th>
              <th>Дата создания</th>
              <th>Документ</th>
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {requests?.map((request: Request) => (
              <tr key={request.id}>
                <td>
                  <strong>{request.record?.refCode}</strong>
                  <br />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {request.record?.title || `ID: ${request.recordId}`}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '3px',
                    backgroundColor: request.type === 'view' ? '#e8f5e9' : '#e3f2fd',
                    color: request.type === 'view' ? '#2e7d32' : '#1565c0'
                  }}>
                    {request.type === 'view' ? '📖 В читальном зале' : '📷 Сканирование'}
                  </span>
                </td>
                <td>
                  {getStatusBadge(request.status)}
                  {request.status === RequestStatus.REJECTED && request.rejectionReason && (
                    <div style={{ fontSize: '0.8rem', color: '#d32f2f', marginTop: '4px' }}>
                      Причина: {request.rejectionReason}
                    </div>
                  )}
                  {request.processedBy && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                      {request.status === RequestStatus.APPROVED ? 'Одобрил' : 
                       request.status === RequestStatus.COMPLETED ? 'Выполнил' :
                       request.status === RequestStatus.REJECTED ? 'Отклонил' : 'Обработал'}: {request.processedBy.fullName}
                    </div>
                  )}
                </td>
                <td>{request.user?.fullName || request.userId}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  {/* Документ доступен для одобренных и выполненных заявок */}
                  {(request.status === RequestStatus.APPROVED || request.status === RequestStatus.COMPLETED) && request.record?.fileName ? (
                    <button
                      className="btn-small"
                      onClick={() => recordsApi.downloadFile(request.record!.id, request.record!.fileName!)}
                      style={{ backgroundColor: '#28a745' }}
                      title={request.record.fileName}
                    >
                      📄 Скачать
                    </button>
                  ) : (request.status === RequestStatus.APPROVED || request.status === RequestStatus.COMPLETED) ? (
                    <span style={{ color: '#999' }}>Нет файла</span>
                  ) : request.status === RequestStatus.REJECTED ? (
                    <span style={{ color: '#d32f2f' }}>Отказано</span>
                  ) : (
                    <span style={{ color: '#999' }}>Ожидает решения</span>
                  )}
                </td>
                {canManage && (
                  <td>
                    {request.status === RequestStatus.NEW && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn-small"
                          onClick={() => handleApprove(request.id)}
                          style={{ backgroundColor: '#28a745' }}
                          title="Одобрить заявку"
                        >
                          ✅ Одобрить
                        </button>
                        <button
                          className="btn-small"
                          onClick={() => handleOpenRejectModal(request.id)}
                          style={{ backgroundColor: '#dc3545' }}
                          title="Отклонить заявку"
                        >
                          ❌ Отклонить
                        </button>
                      </div>
                    )}
                    {request.status === RequestStatus.IN_PROGRESS && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn-small"
                          onClick={() => handleApprove(request.id)}
                          style={{ backgroundColor: '#28a745' }}
                        >
                          ✅ Одобрить
                        </button>
                        <button
                          className="btn-small"
                          onClick={() => handleOpenRejectModal(request.id)}
                          style={{ backgroundColor: '#dc3545' }}
                        >
                          ❌ Отклонить
                        </button>
                      </div>
                    )}
                    {request.status === RequestStatus.APPROVED && (
                      <button
                        className="btn-small"
                        onClick={() => handleComplete(request.id)}
                        style={{ backgroundColor: '#9c27b0', color: 'white' }}
                        title="Отметить как выполненную"
                      >
                        📦 Выполнена
                      </button>
                    )}
                    {request.status === RequestStatus.REJECTED && (
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>Обработана</span>
                    )}
                    {request.status === RequestStatus.COMPLETED && (
                      <span style={{ color: '#9c27b0', fontSize: '0.85rem', fontWeight: 'bold' }}>Выполнена</span>
                    )}
                    <button
                      className="btn-small btn-danger"
                      onClick={() => {
                        if (confirm('Удалить заявку?')) {
                          deleteMutation.mutate(request.id)
                        }
                      }}
                      style={{ marginLeft: '0.25rem' }}
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
