// src/stores/auth.js
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
    // Profil bilgilerini (ad soyad + email) günceller
    async updateProfile(payload) {
      // payload: { fullName, email }
      const response = await api.put('/auth/profile', payload)
      // Backend UserProfileDto döner: { fullName, email, role }
      this.fullName = response.data.fullName
      this.email = response.data.email
      localStorage.setItem('fullName', response.data.fullName)
      localStorage.setItem('email', response.data.email)
    },
    // Şifre değiştirir. Backend başarılı olursa tüm refresh token'ları
    // iptal ediyor, bu yüzden burada da güvenlik amacıyla oturumu kapatıyoruz.
    async changePassword(payload) {
      // payload: { currentPassword, newPassword }
      await api.put('/auth/change-password', payload)
      await this.logout()
    },
    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('Sunucudan çıkış yapılırken hata oluştu, yerel oturum temizleniyor:', error.message)
      } finally {
        this.clearSession()
      }
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