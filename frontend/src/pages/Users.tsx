import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../contexts/ToastContext'
import api from '../api/axios'
import { User, Role } from '../types'
import UserRoleForm from '../components/UserRoleForm'
import './TablePage.css'

export default function Users() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((res) => res.data),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) =>
      api.patch(`/users/${userId}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('Роль пользователя успешно изменена', 'success')
    },
    onError: () => {
      showToast('Ошибка при изменении роли пользователя', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('Пользователь успешно удалён', 'success')
    },
    onError: () => {
      showToast('Ошибка при удалении пользователя', 'error')
    },
  })

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setIsRoleFormOpen(true)
  }

  const handleRoleSubmit = async (userId: number, role: Role) => {
    await updateRoleMutation.mutateAsync({ userId, role })
    setIsRoleFormOpen(false)
    setSelectedUser(null)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'archivist':
        return 'Архивариус'
      case 'researcher':
        return 'Исследователь'
      default:
        return role
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'badge-admin'
      case 'archivist':
        return 'badge-archivist'
      case 'researcher':
        return 'badge-researcher'
      default:
        return ''
    }
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Пользователи</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Всего пользователей: {users?.length || 0}
        </p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-small btn-primary"
                      onClick={() => handleChangeRole(user)}
                      title="Изменить роль"
                    >
                      Изменить роль
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => {
                        if (confirm(`Удалить пользователя ${user.fullName}?`)) {
                          deleteMutation.mutate(user.id)
                        }
                      }}
                      title="Удалить"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserRoleForm
        isOpen={isRoleFormOpen}
        onClose={() => {
          setIsRoleFormOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleRoleSubmit}
        user={selectedUser}
      />
    </div>
  )
}

