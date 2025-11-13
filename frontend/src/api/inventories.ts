import api from './axios'
import { Inventory } from '../types'

export const inventoriesApi = {
  getAll: (fondId?: number) => {
    const params = fondId ? { fondId } : {}
    return api.get<Inventory[]>('/inventories', { params }).then((res) => res.data)
  },
  getOne: (id: number) => api.get<Inventory>(`/inventories/${id}`).then((res) => res.data),
  create: (data: Partial<Inventory>) =>
    api.post<Inventory>('/inventories', data).then((res) => res.data),
  update: (id: number, data: Partial<Inventory>) =>
    api.patch<Inventory>(`/inventories/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/inventories/${id}`).then((res) => res.data),
}

