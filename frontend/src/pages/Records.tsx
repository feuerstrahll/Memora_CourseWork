import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { recordsApi, fondsApi, requestsApi } from '../api'
import { Record, Role, RequestType } from '../types'
import Pagination from '../components/Pagination'
import RecordForm from '../components/RecordForm'
import RequestForm from '../components/RequestForm'
import './TablePage.css'

export default function Records() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [fondId, setFondId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<number | undefined>()

  const { data: fonds } = useQuery({
    queryKey: ['fonds'],
    queryFn: fondsApi.getAll,
  })

  const { data: searchResult } = useQuery({
    queryKey: ['records', 'search', search, fondId, page],
    queryFn: () => recordsApi.search({ search, fondId, page, limit }),
    enabled: !!search || !!fondId,
  })

  const { data: records } = useQuery({
    queryKey: ['records'],
    queryFn: () => recordsApi.getAll(),
    enabled: !search && !fondId,
  })

  const createMutation = useMutation({
    mutationFn: recordsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      showToast('Единица хранения успешно создана', 'success')
    },
    onError: () => {
      showToast('Ошибка при создании единицы хранения', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Record> }) =>
      recordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      showToast('Единица хранения успешно обновлена', 'success')
    },
    onError: () => {
      showToast('Ошибка при обновлении единицы хранения', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: recordsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      showToast('Единица хранения успешно удалена', 'success')
    },
    onError: () => {
      showToast('Ошибка при удалении единицы хранения', 'error')
    },
  })

  const createRequestMutation = useMutation({
    mutationFn: requestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      showToast('Заявка успешно подана', 'success')
    },
    onError: () => {
      showToast('Ошибка при подаче заявки', 'error')
    },
  })

  const handleSubmit = async (data: Partial<Record>) => {
    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsFormOpen(false)
    setEditingRecord(null)
  }

  const handleEdit = (record: Record) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleRequestSubmit = async (data: { recordId: number; type: RequestType }) => {
    await createRequestMutation.mutateAsync(data)
    setIsRequestFormOpen(false)
    setSelectedRecordId(undefined)
  }

  const handleOpenRequestForm = (recordId: number) => {
    setSelectedRecordId(recordId)
    setIsRequestFormOpen(true)
  }

  const canEdit = user?.role === Role.ADMIN || user?.role === Role.ARCHIVIST
  const data = search || fondId ? searchResult?.data : records || []

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Единицы хранения</h1>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditingRecord(null)
              setIsFormOpen(true)
            }}
          >
            Добавить
          </button>
        )}
      </div>

      <RecordForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingRecord(null)
        }}
        onSubmit={handleSubmit}
        record={editingRecord}
      />

      <RequestForm
        isOpen={isRequestFormOpen}
        onClose={() => {
          setIsRequestFormOpen(false)
          setSelectedRecordId(undefined)
        }}
        onSubmit={handleRequestSubmit}
        preselectedRecordId={selectedRecordId}
      />

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию, аннотации или шифру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={fondId || ''}
          onChange={(e) => setFondId(e.target.value ? +e.target.value : undefined)}
          className="filter-select"
        >
          <option value="">Все фонды</option>
          {fonds?.map((fond) => (
            <option key={fond.id} value={fond.id}>
              {fond.code} - {fond.title}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Шифр</th>
              <th>Название</th>
              <th>Опись</th>
              <th>Фонд</th>
              <th>Даты</th>
              <th>Доступ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record: Record) => (
              <tr key={record.id}>
                <td>{record.refCode}</td>
                <td>{record.title}</td>
                <td>{record.inventory?.number}</td>
                <td>{record.inventory?.fond?.code}</td>
                <td>
                  {record.dateFrom && record.dateTo
                    ? `${new Date(record.dateFrom).toLocaleDateString()} - ${new Date(record.dateTo).toLocaleDateString()}`
                    : record.dateFrom
                    ? new Date(record.dateFrom).toLocaleDateString()
                    : '-'}
                </td>
                <td>{record.accessLevel === 'public' ? 'Публичный' : 'Ограниченный'}</td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => handleOpenRequestForm(record.id)}
                    style={{ marginRight: '0.5rem', backgroundColor: '#28a745' }}
                  >
                    Подать заявку
                  </button>
                  {canEdit && (
                    <>
                      <button
                        className="btn-small"
                        onClick={() => handleEdit(record)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Редактировать
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => {
                          if (confirm('Удалить запись?')) {
                            deleteMutation.mutate(record.id)
                          }
                        }}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {searchResult && searchResult.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={searchResult.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  )
}

