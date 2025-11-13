import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoriesApi } from '../api'
import { Inventory } from '../types'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import InventoryForm from '../components/InventoryForm'
import './TablePage.css'

export default function Inventories() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null)

  const canEdit = user?.role === 'admin' || user?.role === 'archivist'

  const { data: inventories } = useQuery({
    queryKey: ['inventories'],
    queryFn: inventoriesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: inventoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      showToast('Опись успешно создана', 'success')
    },
    onError: () => {
      showToast('Ошибка при создании описи', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Inventory> }) =>
      inventoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      showToast('Опись успешно обновлена', 'success')
    },
    onError: () => {
      showToast('Ошибка при обновлении описи', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: inventoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      showToast('Опись успешно удалена', 'success')
    },
    onError: () => {
      showToast('Ошибка при удалении описи', 'error')
    },
  })

  const handleSubmit = async (data: Partial<Inventory>) => {
    if (editingInventory) {
      await updateMutation.mutateAsync({ id: editingInventory.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsFormOpen(false)
    setEditingInventory(null)
  }

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory)
    setIsFormOpen(true)
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Описи</h1>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditingInventory(null)
              setIsFormOpen(true)
            }}
          >
            Добавить
          </button>
        )}
      </div>

      <InventoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingInventory(null)
        }}
        onSubmit={handleSubmit}
        inventory={editingInventory}
      />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Название</th>
              <th>Фонд</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {inventories?.map((inventory: any) => (
              <tr key={inventory.id}>
                <td>{inventory.number}</td>
                <td>{inventory.title}</td>
                <td>
                  {inventory.fond?.code} - {inventory.fond?.title}
                </td>
                <td>
                  {canEdit && (
                    <>
                      <button
                        className="btn-small"
                        onClick={() => handleEdit(inventory)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Редактировать
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => {
                          if (confirm('Удалить опись?')) {
                            deleteMutation.mutate(inventory.id)
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
    </div>
  )
}

