import { Link } from 'react-router-dom'
import './NotFound.css'

export default function Forbidden() {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-code">403</h1>
        <h2 className="error-title">Доступ запрещён</h2>
        <p className="error-message">
          У вас нет прав для доступа к этой странице. Обратитесь к администратору, если считаете что это ошибка.
        </p>
        <Link to="/" className="error-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
