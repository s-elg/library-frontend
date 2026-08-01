import api from './api'

// Ödünç işlemleri servisi - LoanController'daki endpoint'leri sarmalar
export const loanService = {
  // Kitap ödünç alma isteği
  async borrowBook(bookId) {
    const response = await api.post('/loan/borrow', { bookId })
    return response.data
  },

  // Giriş yapmış kullanıcının kendi ödünç kayıtları
  async getMyLoans() {
    const response = await api.get('/loan/my-loans')
    return response.data
  },

  // Tek bir loan kaydını id ile getirir
  async getById(id) {
    const response = await api.get(`/loan/${id}`)
    return response.data
  },

  // Admin - kitabı iade edilmiş olarak işaretler
  async returnBook(id) {
    const response = await api.put(`/loan/${id}/return`)
    return response.data
  },

  // Admin - tüm aktif ödünçler
  async getActiveLoans() {
    const response = await api.get('/loan/active')
    return response.data
  },

  // Admin - belirli bir kullanıcının ödünçleri
  async getUserLoans(userId) {
    const response = await api.get(`/loan/user/${userId}`)
    return response.data
  },
}