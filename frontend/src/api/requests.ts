import api from './axios'
import { Request } from '../types'

export const requestsApi = {
  getAll: () => api.get<Request[]>('/requests').then((res) => res.data),
  getOne: (id: number) => api.get<Request>(`/requests/${id}`).then((res) => res.data),
  create: (data: Partial<Request>) => api.post<Request>('/requests', data).then((res) => res.data),
  update: (id: number, data: Partial<Request>) =>
    api.patch<Request>(`/requests/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/requests/${id}`).then((res) => res.data),
}

