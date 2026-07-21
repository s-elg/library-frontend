import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    email: localStorage.getItem('email') || null,
    fullName: localStorage.getItem('fullName') || null,
    role: localStorage.getItem('role') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => Number(state.role) === 1,
  },
  actions: {
    async login(credentials) {
      const response = await api.post('/auth/login', credentials)
      this.setSession(response.data)
    },
    async register(payload) {
      const response = await api.post('/auth/register', payload)
      this.setSession(response.data)
    },
    setSession(data) {
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.email = data.email
      this.fullName = data.fullName
      this.role = data.role

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('email', data.email)
      localStorage.setItem('fullName', data.fullName)
      localStorage.setItem('role', data.role)
    },
    async logout() {
      await api.post('/auth/logout')
      this.clearSession()
    },
    clearSession() {
      this.accessToken = null
      this.refreshToken = null
      this.email = null
      this.fullName = null
      this.role = null
      localStorage.clear()
    },
  },
})