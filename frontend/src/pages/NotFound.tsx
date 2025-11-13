import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Страница не найдена</h2>
        <p className="error-message">
          К сожалению, запрашиваемая страница не существует или была удалена.
        </p>
        <Link to="/" className="error-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
