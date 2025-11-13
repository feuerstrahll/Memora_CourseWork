import api from './axios'
import { Fond } from '../types'

export const fondsApi = {
  getAll: () => api.get<Fond[]>('/fonds').then((res) => res.data),
  getOne: (id: number) => api.get<Fond>(`/fonds/${id}`).then((res) => res.data),
  create: (data: Partial<Fond>) => api.post<Fond>('/fonds', data).then((res) => res.data),
  update: (id: number, data: Partial<Fond>) =>
    api.patch<Fond>(`/fonds/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/fonds/${id}`).then((res) => res.data),
}

