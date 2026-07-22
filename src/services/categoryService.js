import api from './api'

// Kategori servisi - CategoryController'daki AllowAnonymous endpoint'lerini sarmalar
export const categoryService = {
  async getAll() {
    const response = await api.get('/category')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/category/${id}`)
    return response.data
  },
}