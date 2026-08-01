<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { bookService } from '@/services/bookService'
import { loanService } from '@/services/loanService'
import { reviewService } from '@/services/reviewService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const book = ref(null)
const reviews = ref([])
const averageRating = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

const borrowState = ref({ loading: false, message: '', success: false })

const reviewForm = ref({ rating: 0, comment: '' })
const reviewSubmitting = ref(false)
const reviewError = ref('')

const bookId = computed(() => route.params.id)

async function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}

// Kitabı, yorumları ve ortalama puanı paralel çekiyoruz.
// Servisler artık response.data'yı zaten döndürdüğü için ".data" tekrar okumuyoruz.
async function fetchBookData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [bookData, reviewsData, avgData] = await Promise.all([
      bookService.getById(bookId.value),
      reviewService.getByBook(bookId.value),
      reviewService.getAverageRating(bookId.value),
    ])
    book.value = bookData
    reviews.value = reviewsData
    averageRating.value = avgData.averageRating ?? 0
  } catch (err) {
    errorMessage.value = 'Kitap bilgileri yüklenirken bir hata oluştu.'
  } finally {
    isLoading.value = false
  }
}

async function handleBorrow() {
  if (!authStore.isAuthenticated) {
    window.location.href = '/login'
    return
  }
  borrowState.value = { loading: true, message: '', success: false }
  try {
    await loanService.borrowBook(bookId.value)
    borrowState.value = {
      loading: false,
      message: 'Kitap başarıyla ödünç alındı!',
      success: true,
    }
    // Stok/uygunluk bilgisini tazelemek için kitabı yeniden çekiyoruz
    book.value = await bookService.getById(bookId.value)
  } catch (err) {
    const apiMessage = err.response?.data?.message || 'Ödünç alma işlemi başarısız oldu.'
    borrowState.value = { loading: false, message: apiMessage, success: false }
  }
}

async function handleReviewSubmit() {
  if (!authStore.isAuthenticated) {
    window.location.href = '/login'
    return
  }
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    await reviewService.createReview({
      bookId: bookId.value,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
    })
    reviewForm.value = { rating: 0, comment: '' }
    const [reviewsData, avgData] = await Promise.all([
      reviewService.getByBook(bookId.value),
      reviewService.getAverageRating(bookId.value),
    ])
    reviews.value = reviewsData
    averageRating.value = avgData.averageRating ?? 0
  } catch (err) {
    reviewError.value = err.response?.data?.message || 'Yorum gönderilirken bir hata oluştu.'
  } finally {
    reviewSubmitting.value = false
  }
}

onMounted(fetchBookData)
</script>

<template>
  <div class="book-detail-page">
    <button class="back-button" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
        Geri Dön
    </button>

    <!-- Yüklenme durumu -->
    <div v-if="isLoading" class="state-message">Yükleniyor...</div>

    <!-- Hata durumu -->
    <div v-else-if="errorMessage" class="state-message error">{{ errorMessage }}</div>

    <!-- İçerik -->
    <div v-else-if="book" class="detail-grid">
      <!-- Sol: Kapak görseli -->
      <div class="cover-panel">
        <img
          :src="book.coverImageUrl || '/placeholder-book.png'"
          :alt="book.title"
          class="cover-image"
        />
      </div>

      <!-- Sağ: Kitap bilgileri -->
      <div class="info-panel">
        <div class="badges">
          <span class="badge badge-category">{{ book.categoryName }}</span>
          <span
            class="badge"
            :class="book.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'"
          >
            {{ book.availableCopies > 0 ? 'Mevcut' : 'Şu Anda Yok' }}
          </span>
        </div>

        <h1 class="title">{{ book.title }}</h1>
        <p class="author">Yazar: {{ book.author }}</p>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">ISBN</span>
            <span class="meta-value">{{ book.isbn }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Toplam Kopya</span>
            <span class="meta-value">{{ book.totalCopies }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Müsait</span>
            <span class="meta-value">{{ book.availableCopies }}</span>
          </div>
        </div>

        <p class="description">{{ book.description }}</p>

        <button
          class="btn-primary"
          :disabled="borrowState.loading || book.availableCopies === 0"
          @click="handleBorrow"
        >
          {{ borrowState.loading ? 'İşleniyor...' : 'Ödünç Al' }}
        </button>

        <p
          v-if="borrowState.message"
          class="borrow-feedback"
          :class="{ success: borrowState.success, error: !borrowState.success }"
        >
          {{ borrowState.message }}
        </p>
      </div>
    </div>

    <!-- Yorumlar Bölümü -->
    <section v-if="book" class="reviews-section">
      <h2 class="section-title">Okuyucu Değerlendirmeleri</h2>

      <div class="reviews-summary">
        <div class="rating-box">
          <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
          <span class="rating-count">{{ reviews.length }} Değerlendirme</span>
        </div>

        <!-- Yorum ekleme formu (backend kimin yorum yazabileceğini kontrol ediyor) -->
        <form class="review-form" @submit.prevent="handleReviewSubmit">
          <label class="form-label">Puanın</label>
          <div class="star-picker">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ active: n <= reviewForm.rating }"
              @click="reviewForm.rating = n"
            >★</span>
          </div>
          <textarea
            v-model="reviewForm.comment"
            class="comment-input"
            rows="3"
            placeholder="Bu kitap hakkında ne düşünüyorsun?"
          ></textarea>
          <p v-if="reviewError" class="review-error">{{ reviewError }}</p>
          <button
            type="submit"
            class="btn-secondary"
            :disabled="reviewSubmitting || reviewForm.rating === 0"
          >
            {{ reviewSubmitting ? 'Gönderiliyor...' : 'Gönder' }}
          </button>
        </form>
      </div>

      <div class="review-list">
        <article v-for="r in reviews" :key="r.id" class="review-card">
          <div class="review-header">
            <span class="review-author">{{ r.userFullName || 'Kullanıcı' }}</span>
            <span class="review-stars">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
          </div>
          <p class="review-comment">{{ r.comment }}</p>
        </article>
        <p v-if="reviews.length === 0" class="no-reviews">Henüz yorum yapılmamış.</p>
      </div>
    </section>
  </div>
</template>

<<style scoped>
.book-detail-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.state-message {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
.state-message.error {
  color: var(--color-error, #b83230);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 4fr 8fr;
  }
}

.cover-panel {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
}
.cover-image {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-hover);
}

.info-panel {
  display: flex;
  flex-direction: column;
}

.badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge-category {
  background-color: var(--color-primary-soft);
  color: var(--color-tertiary);
}
.badge-available {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}
.badge-unavailable {
  background-color: rgba(184, 50, 48, 0.15);
  color: var(--color-error, #b83230);
}

.title {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}
.author {
  font-family: var(--font-heading);
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  margin-bottom: 1.5rem;
}
.meta-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}
.meta-value {
  font-weight: 600;
  color: var(--color-text);
}

.description {
  line-height: 1.6;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.btn-primary {
  align-self: flex-start;
  background-color: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.9rem 2rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.borrow-feedback {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.borrow-feedback.success {
  color: var(--color-primary);
}
.borrow-feedback.error {
  color: var(--color-error, #b83230);
}

.reviews-section {
  margin-top: 4rem;
  border-top: 1px solid var(--color-outline-variant);
  padding-top: 3rem;
}
.section-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.reviews-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.rating-box {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  text-align: center;
  min-width: 180px;
  box-shadow: var(--shadow-soft);
}
.rating-number {
  display: block;
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
.rating-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.review-form {
  flex: 1;
  min-width: 260px;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-soft);
}
.form-label {
  font-size: 13px;
  color: var(--color-text-muted);
}
.star-picker {
  display: flex;
  gap: 0.25rem;
  margin: 0.5rem 0 1rem;
  font-size: 1.5rem;
  color: var(--color-outline-variant);
  cursor: pointer;
}
.star.active {
  color: var(--color-tertiary);
}
.comment-input {
  width: 100%;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-soft);
  padding: 0.75rem;
  resize: none;
  margin-bottom: 0.75rem;
}
.review-error {
  color: var(--color-error, #b83230);
  font-size: 13px;
  margin-bottom: 0.5rem;
}
.btn-secondary {
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
  padding: 0.6rem 1.5rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
}
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.review-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-soft);
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.review-author {
  font-weight: 700;
  color: var(--color-text);
}
.review-stars {
  color: var(--color-tertiary);
}
.review-comment {
  color: var(--color-text);
  line-height: 1.6;
}
.no-reviews {
  color: var(--color-text-muted);
  text-align: center;
  padding: 2rem;
}
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
}
.back-button:hover {
  color: var(--color-primary);
}
.back-button .material-symbols-outlined {
  font-size: 20px;
}
</style>