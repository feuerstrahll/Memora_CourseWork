import api from './axios'
import { Record } from '../types'

export const recordsApi = {
  getAll: (inventoryId?: number) => {
    const params = inventoryId ? { inventoryId } : {}
    return api.get<Record[]>('/records', { params }).then((res) => res.data)
  },
  getOne: (id: number) => api.get<Record>(`/records/${id}`).then((res) => res.data),
  search: (params: any) =>
    api.get<{ data: Record[]; total: number; page: number; limit: number; totalPages: number }>(
      '/records/search',
      { params },
    ).then((res) => res.data),
  create: (data: Partial<Record>) => api.post<Record>('/records', data).then((res) => res.data),
  update: (id: number, data: Partial<Record>) =>
    api.patch<Record>(`/records/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/records/${id}`).then((res) => res.data),
  uploadFile: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Record>(`/records/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data)
  },
  downloadFile: (id: number, fileName: string) => {
    return api.get(`/records/${id}/download`, {
      responseType: 'blob',
    }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
  },
  deleteFile: (id: number) => api.delete(`/records/${id}/file`).then((res) => res.data),
}

