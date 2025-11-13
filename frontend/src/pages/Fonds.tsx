import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fondsApi } from '../api'
import { Fond } from '../types'
import { useToast } from '../contexts/ToastContext'
import FondForm from '../components/FondForm'
import './TablePage.css'

export default function Fonds() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFond, setEditingFond] = useState<Fond | null>(null)

  const { data: fonds } = useQuery({
    queryKey: ['fonds'],
    queryFn: fondsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: fondsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fonds'] })
      showToast('Фонд успешно создан', 'success')
    },
    onError: () => {
      showToast('Ошибка при создании фонда', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Fond> }) =>
      fondsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fonds'] })
      showToast('Фонд успешно обновлён', 'success')
    },
    onError: () => {
      showToast('Ошибка при обновлении фонда', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: fondsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fonds'] })
      showToast('Фонд успешно удалён', 'success')
    },
    onError: () => {
      showToast('Ошибка при удалении фонда', 'error')
    },
  })

  const handleSubmit = async (data: Partial<Fond>) => {
    if (editingFond) {
      await updateMutation.mutateAsync({ id: editingFond.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsFormOpen(false)
    setEditingFond(null)
  }

  const handleEdit = (fond: Fond) => {
    setEditingFond(fond)
    setIsFormOpen(true)
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Фонды</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingFond(null)
            setIsFormOpen(true)
          }}
        >
          Добавить
        </button>
      </div>

      <FondForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingFond(null)
        }}
        onSubmit={handleSubmit}
        fond={editingFond}
      />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Код</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Хронология</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {fonds?.map((fond: Fond) => (
              <tr key={fond.id}>
                <td>{fond.code}</td>
                <td>{fond.title}</td>
                <td>{fond.description || '-'}</td>
                <td>{fond.coverageDates || '-'}</td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => handleEdit(fond)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => {
                      if (confirm('Удалить фонд?')) {
                        deleteMutation.mutate(fond.id)
                      }
                    }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

