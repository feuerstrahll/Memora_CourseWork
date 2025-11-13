import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { requestsApi } from '../api'
import { Request, Role, RequestStatus, RequestType } from '../types'
import RequestForm from '../components/RequestForm'
import './TablePage.css'

export default function Requests() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: requestsApi.getAll,
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
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) =>
      requestsApi.update(id, { status }),
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

  const canManage = user?.role === Role.ADMIN || user?.role === Role.ARCHIVIST

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Заявки</h1>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          Создать заявку
        </button>
      </div>

      <RequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleRequestSubmit}
      />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Единица хранения</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Пользователь</th>
              <th>Дата создания</th>
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {requests?.map((request: Request) => (
              <tr key={request.id}>
                <td>{request.record?.title || request.recordId}</td>
                <td>{request.type === 'view' ? 'Просмотр' : 'Сканирование'}</td>
                <td>
                  {request.status === 'new'
                    ? 'Новая'
                    : request.status === 'in_progress'
                    ? 'В работе'
                    : 'Выполнена'}
                </td>
                <td>{request.user?.fullName || request.userId}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                {canManage && (
                  <td>
                    {request.status === RequestStatus.NEW && (
                      <button
                        className="btn-small"
                        onClick={() =>
                          updateMutation.mutate({
                            id: request.id,
                            status: RequestStatus.IN_PROGRESS,
                          })
                        }
                      >
                        В работу
                      </button>
                    )}
                    {request.status === RequestStatus.IN_PROGRESS && (
                      <button
                        className="btn-small"
                        onClick={() =>
                          updateMutation.mutate({
                            id: request.id,
                            status: RequestStatus.COMPLETED,
                          })
                        }
                      >
                        Завершить
                      </button>
                    )}
                    <button
                      className="btn-small btn-danger"
                      onClick={() => {
                        if (confirm('Удалить заявку?')) {
                          deleteMutation.mutate(request.id)
                        }
                      }}
                    >
                      Удалить
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

