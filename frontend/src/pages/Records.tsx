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

  const { data: searchResult, error: searchError, isLoading: isSearchLoading } = useQuery({
    queryKey: ['records', 'search', search, fondId, page],
    queryFn: () => {
      const params = { search, fondId, page, limit }
      console.log('Frontend: Sending search request with params:', params)
      return recordsApi.search(params)
    },
    enabled: !!search || !!fondId,
    retry: false,
    onError: (error: any) => {
      console.error('Frontend: Search error:', error)
      // Не показываем ошибку для ошибок валидации (400) - это нормально
      if (error.response?.status !== 400 && error.response?.status !== 401) {
        showToast('Ошибка при поиске записей', 'error')
      }
    },
    onSuccess: (data) => {
      console.log('Frontend: Search result:', data)
    },
  })

  const { data: records, isLoading: isRecordsLoading } = useQuery({
    queryKey: ['records'],
    queryFn: () => recordsApi.getAll(),
    enabled: !search && !fondId,
  })

  const createMutation = useMutation({
    mutationFn: recordsApi.create,
    onSuccess: () => {
      // Инвалидируем все запросы связанные с records (и общий список, и поиск)
      queryClient.invalidateQueries({ queryKey: ['records'] })
      // Также инвалидируем поисковые запросы явно
      queryClient.invalidateQueries({ queryKey: ['records', 'search'] })
      // Если активен фильтр, сбрасываем страницу на 1, чтобы увидеть новую запись
      if (fondId || search) {
        setPage(1)
      }
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
      // Инвалидируем все запросы связанные с records (и общий список, и поиск)
      queryClient.invalidateQueries({ queryKey: ['records'] })
      // Также инвалидируем поисковые запросы явно
      queryClient.invalidateQueries({ queryKey: ['records', 'search'] })
      showToast('Единица хранения успешно обновлена', 'success')
    },
    onError: () => {
      showToast('Ошибка при обновлении единицы хранения', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: recordsApi.delete,
    onSuccess: () => {
      // Инвалидируем все запросы связанные с records (и общий список, и поиск)
      queryClient.invalidateQueries({ queryKey: ['records'] })
      // Также инвалидируем поисковые запросы явно
      queryClient.invalidateQueries({ queryKey: ['records', 'search'] })
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
  // Обрабатываем данные: если есть ошибка поиска (кроме 400), показываем пустой массив
  // Иначе берем данные из searchResult или records
  const data = search || fondId 
    ? (searchError && searchError.response?.status !== 400 ? [] : (searchResult?.data ?? []))
    : (records ?? [])
  
  const isLoading = search || fondId ? isSearchLoading : isRecordsLoading

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
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1) // Сбрасываем страницу при изменении поиска
          }}
          className="search-input"
        />
        <select
          value={fondId || ''}
          onChange={(e) => {
            const value = e.target.value
            const newFondId = value && value !== '' ? +value : undefined
            setFondId(newFondId)
            setPage(1) // Сбрасываем страницу при изменении фильтра
            // Очищаем поиск при выборе фонда, чтобы избежать конфликтов
            if (newFondId && search) {
              setSearch('')
            }
          }}
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
            {isLoading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Загрузка...
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && (search || fondId) && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Записи не найдены
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && !search && !fondId && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Нет данных
                </td>
              </tr>
            )}
            {!isLoading && data.map((record: Record) => (
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

