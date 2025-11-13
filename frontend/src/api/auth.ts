import api from './axios'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((res) => res.data),
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data).then((res) => res.data),
}

