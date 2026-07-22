import api from './api'

// Kitap servisi - BookController'daki AllowAnonymous (herkese açık) endpoint'leri sarmalar
export const bookService = {
  // Genel liste - filtre yokken
  async getAll(pageNumber = 1, pageSize = 10) {
    const response = await api.get('/book', {
      params: { pageNumber, pageSize },
    })
    return response.data
  },

  // Arama kutusu doluyken
  async search(searchTerm, pageNumber = 1, pageSize = 10) {
    const response = await api.get('/book/search', {
      params: { searchTerm, pageNumber, pageSize },
    })
    return response.data
  },

  // Sol menüden bir kategori seçiliyken
  async getByCategory(categoryId, pageNumber = 1, pageSize = 10) {
    const response = await api.get(`/book/category/${categoryId}`, {
      params: { pageNumber, pageSize },
    })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/book/${id}`)
    return response.data
  },
}