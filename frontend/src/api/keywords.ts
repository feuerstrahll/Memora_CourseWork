import api from './axios'
import { Keyword } from '../types'

export const keywordsApi = {
  getAll: () => api.get<Keyword[]>('/keywords').then((res) => res.data),
  getOne: (id: number) => api.get<Keyword>(`/keywords/${id}`).then((res) => res.data),
  create: (data: Partial<Keyword>) =>
    api.post<Keyword>('/keywords', data).then((res) => res.data),
  update: (id: number, data: Partial<Keyword>) =>
    api.patch<Keyword>(`/keywords/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/keywords/${id}`).then((res) => res.data),
}

