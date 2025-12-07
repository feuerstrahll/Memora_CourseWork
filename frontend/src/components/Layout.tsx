import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Role } from '../types'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === Role.ADMIN
  const isArchivist = user?.role === Role.ARCHIVIST || isAdmin

  // Аварийный сброс overflow при монтировании и смене маршрута
  useEffect(() => {
    // Проверяем, нет ли открытых модальных окон
    const hasOpenModal = document.querySelector('.modal-overlay')
    if (!hasOpenModal) {
      // Если нет открытых модальных окон, сбрасываем overflow
      document.body.style.overflow = 'unset'
    }
  }, [location.pathname])

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>Архивное веб-приложение</h1>
          <div className="header-right">
            <span className="user-info">{user?.fullName} ({user?.role})</span>
            <button onClick={logout} className="logout-btn">
              Выйти
            </button>
          </div>
        </div>
      </header>
      <div className="container">
        <aside className="sidebar">
          <nav>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Главная
            </Link>
            <Link to="/records" className={location.pathname === '/records' ? 'active' : ''}>
              Единицы хранения
            </Link>
            {isArchivist && (
              <>
                <Link to="/fonds" className={location.pathname === '/fonds' ? 'active' : ''}>
                  Фонды
                </Link>
                <Link
                  to="/inventories"
                  className={location.pathname === '/inventories' ? 'active' : ''}
                >
                  Описи
                </Link>
              </>
            )}
            <Link to="/requests" className={location.pathname === '/requests' ? 'active' : ''}>
              Заявки
            </Link>
            <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
              Статистика
            </Link>
            {isAdmin && (
              <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                Пользователи
              </Link>
            )}
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              Об авторе
            </Link>
          </nav>
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

