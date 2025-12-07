import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../api/axios'
import { usersApi } from '../api'
import { Role, UpdateProfileData } from '../types'
import './Dashboard.css'

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  
  // Состояние формы профиля
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    fullName: user?.fullName || '',
    occupation: user?.occupation || '',
    workplace: user?.workplace || '',
    position: user?.position || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((res) => res.data),
  })

  const handleProfileChange = (field: keyof UpdateProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const updatedUser = await usersApi.updateProfile(profileData)
      updateUser(updatedUser)
      setIsEditingProfile(false)
      showToast('Профиль успешно обновлён', 'success')
    } catch (error) {
      showToast('Ошибка при сохранении профиля', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setProfileData({
      fullName: user?.fullName || '',
      occupation: user?.occupation || '',
      workplace: user?.workplace || '',
      position: user?.position || '',
    })
    setIsEditingProfile(false)
  }

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

      {/* Секция личной информации для всех пользователей */}
      <div className="profile-section">
        <div className="profile-header">
          <h2>Личная информация</h2>
          {!isEditingProfile && (
            <button 
              className="btn-edit-profile"
              onClick={() => setIsEditingProfile(true)}
            >
              ✏️ Редактировать
            </button>
          )}
        </div>
        
        {isEditingProfile ? (
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="fullName">Полное имя</label>
              <input
                type="text"
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
                placeholder="Ваше полное имя..."
              />
            </div>
            {user?.role === Role.RESEARCHER && (
              <>
                <div className="form-group">
                  <label htmlFor="occupation">Род деятельности</label>
                  <input
                    type="text"
                    id="occupation"
                    value={profileData.occupation}
                    onChange={(e) => handleProfileChange('occupation', e.target.value)}
                    placeholder="Например: Историк, Краевед, Студент..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="workplace">Место работы / учёбы</label>
                  <input
                    type="text"
                    id="workplace"
                    value={profileData.workplace}
                    onChange={(e) => handleProfileChange('workplace', e.target.value)}
                    placeholder="Например: МГУ им. М.В. Ломоносова..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Должность</label>
                  <input
                    type="text"
                    id="position"
                    value={profileData.position}
                    onChange={(e) => handleProfileChange('position', e.target.value)}
                    placeholder="Например: Профессор, Аспирант..."
                  />
                </div>
              </>
            )}
            <div className="profile-form-actions">
              <button 
                className="btn-save"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : '💾 Сохранить'}
              </button>
              <button 
                className="btn-cancel"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="profile-field">
              <span className="field-label">Полное имя:</span>
              <span className="field-value">{user?.fullName || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{user?.email || '—'}</span>
            </div>
            {user?.role === Role.RESEARCHER && (
              <>
                <div className="profile-field">
                  <span className="field-label">Род деятельности:</span>
                  <span className="field-value">{user?.occupation || '—'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Место работы / учёбы:</span>
                  <span className="field-value">{user?.workplace || '—'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Должность:</span>
                  <span className="field-value">{user?.position || '—'}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

