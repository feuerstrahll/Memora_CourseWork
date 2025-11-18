import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { Role } from '../types'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((res) => res.data),
  })

  return (
    <div className="dashboard">
      <h1>Добро пожаловать, {user?.fullName}!</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Фондов</h3>
          <p className="stat-number">{stats?.fonds || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Описей</h3>
          <p className="stat-number">{stats?.inventories || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Единиц хранения</h3>
          <p className="stat-number">{stats?.records || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Цифровых копий</h3>
          <p className="stat-number">{stats?.digitalCopies || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Заявок</h3>
          <p className="stat-number">{stats?.requests || 0}</p>
        </div>
        {user?.role === Role.ADMIN && (
          <div className="stat-card">
            <h3>Пользователей</h3>
            <p className="stat-number">{stats?.users || 0}</p>
          </div>
        )}
      </div>
      <div className="dashboard-info">
        <h2>Информация</h2>
        <p>Ваша роль: <strong>{user?.role}</strong></p>
        <p>
          {user?.role === Role.RESEARCHER
            ? 'Вы можете искать и просматривать архивные единицы, а также отправлять заявки на просмотр или оцифровку.'
            : user?.role === Role.ARCHIVIST
            ? 'Вы можете управлять фондами, описями и единицами хранения, а также обрабатывать заявки исследователей.'
            : 'Вы имеете полный доступ ко всем функциям системы, включая управление пользователями.'}
        </p>
      </div>
    </div>
  )
}

