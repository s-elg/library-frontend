import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:7247/api', // kendi API portunla değiştir
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api