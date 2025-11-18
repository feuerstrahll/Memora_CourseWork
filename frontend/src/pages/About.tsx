import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-card">
        <h1>Об авторе</h1>
        
        <div className="about-section">
          <h2>Персональная информация</h2>
          <div className="info-row">
            <span className="label">ФИО:</span>
            <span className="value">Путинцева Анастасия Александровна</span>
          </div>
          <div className="info-row">
            <span className="label">Группа:</span>
            <span className="value">ИД23-3</span>
          </div>
          <div className="info-row">
            <span className="label">Учебное заведение:</span>
            <span className="value">Финансовый университет при Правительстве РФ</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">233479@edu.fa.ru</span>
          </div>
        </div>

        <div className="about-section">
          <h2>О проекте</h2>
          <div className="info-row">
            <span className="label">Название:</span>
            <span className="value">Архивное веб-приложение</span>
          </div>
          <div className="info-row">
            <span className="label">Дата начала:</span>
            <span className="value">Сентябрь 2025</span>
          </div>
          <div className="info-row">
            <span className="label">Дата завершения:</span>
            <span className="value">Декабрь 2025</span>
          </div>
        </div>

        <div className="about-section">
          <h2>Технологический стек</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h3>Frontend</h3>
              <ul>
                <li><strong>React 18</strong> - библиотека для создания пользовательских интерфейсов</li>
                <li><strong>TypeScript</strong> - типизированный JavaScript для повышения надежности кода</li>
                <li><strong>Vite</strong> - современный инструмент сборки с быстрой горячей перезагрузкой</li>
                <li><strong>React Router</strong> - маршрутизация в SPA приложении</li>
                <li><strong>TanStack Query</strong> - управление серверным состоянием и кешированием</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Backend</h3>
              <ul>
                <li><strong>Node.js</strong> - серверная среда выполнения JavaScript</li>
                <li><strong>NestJS</strong> - прогрессивный фреймворк для создания масштабируемых серверных приложений</li>
                <li><strong>TypeORM</strong> - ORM для работы с базой данных</li>
                <li><strong>JWT</strong> - аутентификация на основе токенов</li>
                <li><strong>Passport</strong> - middleware для аутентификации</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>База данных</h3>
              <ul>
                <li><strong>PostgreSQL 15</strong> - реляционная база данных</li>
                <li><strong>Redis</strong> - хранилище данных в памяти для кеширования</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Инфраструктура</h3>
              <ul>
                <li><strong>Docker</strong> - контейнеризация приложений</li>
                <li><strong>Docker Compose</strong> - оркестрация многоконтейнерных приложений</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Опыт работы с технологиями</h2>
          <div className="experience">
            <p>
              В процессе разработки данного проекта был получен практический опыт работы с современным 
              стеком веб-технологий. Освоены принципы создания full-stack приложений, включая:
            </p>
            <ul>
              <li>Проектирование RESTful API с использованием NestJS</li>
              <li>Реализация системы аутентификации и авторизации на основе JWT</li>
              <li>Работа с PostgreSQL и TypeORM для управления данными</li>
              <li>Создание отзывчивых пользовательских интерфейсов с React и TypeScript</li>
              <li>Управление состоянием приложения с помощью React Query</li>
              <li>Контейнеризация приложений с Docker и Docker Compose</li>
              <li>Реализация ролевой модели доступа (RBAC)</li>
              <li>Проектирование нормализованной структуры базы данных</li>
            </ul>
          </div>
        </div>

        <div className="about-section">
          <h2>Функциональность приложения</h2>
          <div className="features">
            <ul>
              <li>Управление фондами, описями и единицами хранения архивных документов</li>
              <li>Система регистрации и авторизации пользователей</li>
              <li>Три уровня доступа: администратор, архивариус, исследователь</li>
              <li>Расширенный поиск и фильтрация документов</li>
              <li>Управление цифровыми копиями документов</li>
              <li>Система заявок исследователей на просмотр и оцифровку</li>
              <li>Статистика и аналитика по использованию системы</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

