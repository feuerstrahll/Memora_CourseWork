import api from './axios'
import { User, UpdateProfileData } from '../types'

export const usersApi = {
  // Получить свой профиль
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Обновить свой профиль
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch('/users/profile', data)
    return response.data
  },
}

