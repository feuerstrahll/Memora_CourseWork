import { useState, useEffect } from 'react'
import Modal from './Modal'
import { User, Role } from '../types'

interface UserRoleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userId: number, role: Role) => Promise<void>
  user: User | null
}

export default function UserRoleForm({ isOpen, onClose, onSubmit, user }: UserRoleFormProps) {
  const [role, setRole] = useState<Role>(Role.RESEARCHER)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await onSubmit(user.id, role)
      onClose()
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Администратор'
      case Role.ARCHIVIST:
        return 'Архивариус'
      case Role.RESEARCHER:
        return 'Исследователь'
      default:
        return role
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Изменить роль пользователя">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Пользователь</label>
          <input
            type="text"
            value={user?.fullName || ''}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            value={user?.email || ''}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </div>

        <div className="form-group">
          <label>Роль *</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} required>
            <option value={Role.RESEARCHER}>{getRoleLabel(Role.RESEARCHER)}</option>
            <option value={Role.ARCHIVIST}>{getRoleLabel(Role.ARCHIVIST)}</option>
            <option value={Role.ADMIN}>{getRoleLabel(Role.ADMIN)}</option>
          </select>
        </div>

        <div className="form-group">
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
            <strong>Описание ролей:</strong>
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            <li><strong>Исследователь:</strong> просмотр и поиск документов, создание заявок</li>
            <li><strong>Архивариус:</strong> управление фондами, описями, документами и заявками</li>
            <li><strong>Администратор:</strong> полный доступ, включая управление пользователями</li>
          </ul>
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

