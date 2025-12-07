import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { recordsApi, fondsApi, requestsApi } from '../api'
import { Record, Role, RequestType, AccessLevel } from '../types'
import Pagination from '../components/Pagination'
import RecordForm from '../components/RecordForm'
import RequestForm from '../components/RequestForm'
import './TablePage.css'

// Типы для сортировки
type SortField = 'refCode' | 'title' | 'inventory' | 'fond' | 'dateFrom' | 'accessLevel' | 'fileName'
type SortDirection = 'asc' | 'desc'

// Типы для фильтров столбцов
interface ColumnFilters {
  refCode: string
  title: string
  inventory: string
  fond: string
  accessLevel: string
  hasFile: string
}

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
  
  // Состояние сортировки
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Состояние фильтров столбцов
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    refCode: '',
    title: '',
    inventory: '',
    fond: '',
    accessLevel: '',
    hasFile: '',
  })
  
  // Показать/скрыть фильтры
  const [showFilters, setShowFilters] = useState(false)

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

  const handleSubmit = async (data: Partial<Record>, file?: File | null) => {
    let recordId: number
    
    if (editingRecord) {
      const updated = await updateMutation.mutateAsync({ id: editingRecord.id, data })
      recordId = updated.id
    } else {
      const created = await createMutation.mutateAsync(data)
      recordId = created.id
    }
    
    // Загружаем файл, если он был выбран
    if (file) {
      try {
        await recordsApi.uploadFile(recordId, file)
        showToast('Файл успешно загружен', 'success')
        queryClient.invalidateQueries({ queryKey: ['records'] })
      } catch (error) {
        showToast('Ошибка при загрузке файла', 'error')
      }
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
  const rawData = search || fondId 
    ? (searchError && searchError.response?.status !== 400 ? [] : (searchResult?.data ?? []))
    : (records ?? [])
  
  const isLoading = search || fondId ? isSearchLoading : isRecordsLoading
  
  // Функция обновления фильтра столбца
  const updateColumnFilter = (field: keyof ColumnFilters, value: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }
  
  // Функция сброса всех фильтров
  const resetFilters = () => {
    setColumnFilters({
      refCode: '',
      title: '',
      inventory: '',
      fond: '',
      accessLevel: '',
      hasFile: '',
    })
    setPage(1)
  }
  
  // Функция переключения сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // Получаем иконку сортировки
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }
  
  // Применяем фильтрацию и сортировку
  const data = useMemo(() => {
    let result = [...rawData]
    
    // Применяем фильтры столбцов
    if (columnFilters.refCode) {
      result = result.filter(r => 
        r.refCode?.toLowerCase().includes(columnFilters.refCode.toLowerCase())
      )
    }
    if (columnFilters.title) {
      result = result.filter(r => 
        r.title?.toLowerCase().includes(columnFilters.title.toLowerCase())
      )
    }
    if (columnFilters.inventory) {
      result = result.filter(r => 
        r.inventory?.number?.toLowerCase().includes(columnFilters.inventory.toLowerCase())
      )
    }
    if (columnFilters.fond) {
      result = result.filter(r => 
        r.inventory?.fond?.code?.toLowerCase().includes(columnFilters.fond.toLowerCase())
      )
    }
    if (columnFilters.accessLevel) {
      result = result.filter(r => r.accessLevel === columnFilters.accessLevel)
    }
    if (columnFilters.hasFile) {
      if (columnFilters.hasFile === 'yes') {
        result = result.filter(r => !!r.fileName)
      } else if (columnFilters.hasFile === 'no') {
        result = result.filter(r => !r.fileName)
      }
    }
    
    // Применяем сортировку
    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0
        
        switch (sortField) {
          case 'refCode':
            comparison = (a.refCode || '').localeCompare(b.refCode || '', 'ru')
            break
          case 'title':
            comparison = (a.title || '').localeCompare(b.title || '', 'ru')
            break
          case 'inventory':
            comparison = (a.inventory?.number || '').localeCompare(b.inventory?.number || '', 'ru')
            break
          case 'fond':
            comparison = (a.inventory?.fond?.code || '').localeCompare(b.inventory?.fond?.code || '', 'ru')
            break
          case 'dateFrom':
            const dateA = a.dateFrom ? new Date(a.dateFrom).getTime() : 0
            const dateB = b.dateFrom ? new Date(b.dateFrom).getTime() : 0
            comparison = dateA - dateB
            break
          case 'accessLevel':
            comparison = (a.accessLevel || '').localeCompare(b.accessLevel || '', 'ru')
            break
          case 'fileName':
            comparison = (a.fileName ? 1 : 0) - (b.fileName ? 1 : 0)
            break
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }
    
    return result
  }, [rawData, columnFilters, sortField, sortDirection])

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
        <button
          className={`btn-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Фильтры по столбцам"
        >
          🔍 Фильтры столбцов
        </button>
        {(showFilters || Object.values(columnFilters).some(v => v)) && (
          <button
            className="btn-reset-filters"
            onClick={resetFilters}
            title="Сбросить фильтры"
          >
            ✕ Сбросить
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table sortable-table">
          <thead>
            <tr>
              <th className="sortable-header" onClick={() => handleSort('refCode')}>
                <span className="header-content">
                  Шифр
                  <span className="sort-icon">{getSortIcon('refCode')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('title')}>
                <span className="header-content">
                  Название
                  <span className="sort-icon">{getSortIcon('title')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('inventory')}>
                <span className="header-content">
                  Опись
                  <span className="sort-icon">{getSortIcon('inventory')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('fond')}>
                <span className="header-content">
                  Фонд
                  <span className="sort-icon">{getSortIcon('fond')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('dateFrom')}>
                <span className="header-content">
                  Даты
                  <span className="sort-icon">{getSortIcon('dateFrom')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('accessLevel')}>
                <span className="header-content">
                  Доступ
                  <span className="sort-icon">{getSortIcon('accessLevel')}</span>
                </span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('fileName')}>
                <span className="header-content">
                  Файл
                  <span className="sort-icon">{getSortIcon('fileName')}</span>
                </span>
              </th>
              <th>Действия</th>
            </tr>
            {showFilters && (
              <tr className="filter-row">
                <th>
                  <input
                    type="text"
                    placeholder="Фильтр..."
                    value={columnFilters.refCode}
                    onChange={(e) => updateColumnFilter('refCode', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Фильтр..."
                    value={columnFilters.title}
                    onChange={(e) => updateColumnFilter('title', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Фильтр..."
                    value={columnFilters.inventory}
                    onChange={(e) => updateColumnFilter('inventory', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Фильтр..."
                    value={columnFilters.fond}
                    onChange={(e) => updateColumnFilter('fond', e.target.value)}
                    className="column-filter-input"
                  />
                </th>
                <th>
                  {/* Даты фильтруются через основной поиск */}
                </th>
                <th>
                  <select
                    value={columnFilters.accessLevel}
                    onChange={(e) => updateColumnFilter('accessLevel', e.target.value)}
                    className="column-filter-select"
                  >
                    <option value="">Все</option>
                    <option value="public">Публичный</option>
                    <option value="restricted">Ограниченный</option>
                  </select>
                </th>
                <th>
                  <select
                    value={columnFilters.hasFile}
                    onChange={(e) => updateColumnFilter('hasFile', e.target.value)}
                    className="column-filter-select"
                  >
                    <option value="">Все</option>
                    <option value="yes">Есть</option>
                    <option value="no">Нет</option>
                  </select>
                </th>
                <th></th>
              </tr>
            )}
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Загрузка...
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && (search || fondId) && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Записи не найдены
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && !search && !fondId && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
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
                  {record.fileName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Researcher НЕ может скачивать файлы напрямую - только через заявки */}
                      {(user?.role === Role.ADMIN || user?.role === Role.ARCHIVIST) ? (
                        <>
                          <button
                            className="btn-small"
                            onClick={() => recordsApi.downloadFile(record.id, record.fileName!)}
                            style={{ backgroundColor: '#17a2b8' }}
                            title={record.fileName}
                          >
                            📎 Скачать
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={async () => {
                              if (confirm('Удалить файл?')) {
                                try {
                                  await recordsApi.deleteFile(record.id)
                                  showToast('Файл успешно удален', 'success')
                                  queryClient.invalidateQueries({ queryKey: ['records'] })
                                } catch (error) {
                                  showToast('Ошибка при удалении файла', 'error')
                                }
                              }
                            }}
                            style={{ fontSize: '0.8rem' }}
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <span style={{ color: '#e74c3c', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          🔒 Через заявку
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>Нет файла</span>
                  )}
                </td>
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

