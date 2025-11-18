import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Редирект на логин только при 401 (Unauthorized) - истекший или невалидный токен
    if (error.response?.status === 401) {
      // Проверяем, что это действительно проблема с авторизацией, а не ошибка валидации
      const isAuthError = 
        error.response?.data?.message?.toLowerCase().includes('unauthorized') ||
        error.response?.data?.message?.toLowerCase().includes('token') ||
        error.response?.data?.message?.toLowerCase().includes('jwt') ||
        !error.response?.data?.message // Если нет сообщения, скорее всего это проблема с токеном
      
      if (isAuthError) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      window.location.href = '/forbidden'
    } else if (error.response?.status === 500) {
      console.error('Server error:', error)
    }
    // Для остальных ошибок (400, 404 и т.д.) просто пробрасываем ошибку дальше
    return Promise.reject(error)
  },
)

export default api

