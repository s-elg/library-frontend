// src/services/penaltyService.js
import api from './api'

// Giriş yapmış kullanıcının kendi ceza kayıtlarını getirir
export async function getMyPenalties() {
  const response = await api.get('/penalty/my-penalties')
  return response.data
}