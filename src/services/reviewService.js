import api from './api'

// Yorum servisi - ReviewController'daki endpoint'leri sarmalar
export const reviewService = {
  // Yeni yorum oluşturur - dto: { bookId, rating, comment }
  async createReview(dto) {
    const response = await api.post('/review', dto)
    return response.data
  },

  // Kullanıcı kendi yorumunu günceller - dto: { rating, comment }
  async updateReview(id, dto) {
    const response = await api.put(`/review/${id}`, dto)
    return response.data
  },

  // Kullanıcı kendi yorumunu (Admin herhangi birini) siler
  async deleteReview(id) {
    await api.delete(`/review/${id}`)
  },

  // Bir kitabın tüm yorumları - herkese açık
  async getByBook(bookId) {
    const response = await api.get(`/review/book/${bookId}`)
    return response.data
  },

  // Bir kitabın ortalama puanı - herkese açık
  async getAverageRating(bookId) {
    const response = await api.get(`/review/book/${bookId}/average-rating`)
    return response.data
  },

  // Giriş yapmış kullanıcının kendi yorumları
  async getMyReviews() {
    const response = await api.get('/review/my-reviews')
    return response.data
  },

  // Admin - belirli kullanıcının yorumları
  async getByUser(userId) {
    const response = await api.get(`/review/user/${userId}`)
    return response.data
  },
}