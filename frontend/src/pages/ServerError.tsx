import { Link } from 'react-router-dom'
import './NotFound.css'

export default function ServerError() {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-code">500</h1>
        <h2 className="error-title">Ошибка сервера</h2>
        <p className="error-message">
          Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже или обратитесь к администратору.
        </p>
        <Link to="/" className="error-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}

