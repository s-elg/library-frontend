<template>
  <MainLayout active="myBooks" :show-search="false" @logout="handleLogout">
    <div class="mybooks-layout">
      <header class="page-header">
        <h1 class="page-title">Kitaplarım</h1>
        <p class="page-subtitle">
          Mevcut ödünçlerinizi ve okuma geçmişinizi buradan yönetin.
        </p>
      </header>

      <!-- Yükleniyor / Hata durumları -->
      <div v-if="loading" class="state-message">Yükleniyor...</div>
      <div v-else-if="error" class="state-message error">
        Bilgileriniz yüklenirken bir sorun oluştu.
      </div>

      <template v-else>
        <!-- Aktif Ödünçler -->
        <section class="section-block">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined">auto_stories</span>
              Şu An Okuduklarım
            </h2>
            <span class="count-badge">{{ activeLoans.length }} Aktif</span>
          </div>

          <div v-if="activeLoans.length === 0" class="state-message small">
            Şu anda ödünç aldığınız bir kitap yok.
          </div>

          <div v-else class="active-grid">
            <div
              v-for="loan in activeLoans"
              :key="loan.id"
              class="active-card"
              :class="{ 'is-overdue': loan.status === 'Overdue' }"
            >
              <div class="active-icon">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <div class="active-body">
                <div class="active-top">
                  <h3 class="active-title">{{ loan.bookTitle }}</h3>
                  <span class="badge" :class="statusBadgeClass(loan.status)">
                    {{ statusLabel(loan.status) }}
                  </span>
                </div>
                <div class="active-dates">
                  <span class="date-row">
                    <span class="material-symbols-outlined">event_available</span>
                    Alındı: {{ formatDate(loan.loanDate) }}
                  </span>
                  <span
                    class="date-row"
                    :class="{ 'text-error': loan.status === 'Overdue' }"
                  >
                    <span class="material-symbols-outlined">calendar_clock</span>
                    Son Teslim: {{ formatDate(loan.dueDate) }}
                    <template v-if="loan.status === 'Overdue'">
                      ({{ daysLate(loan.dueDate) }} gün gecikti)
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Okuma Geçmişi -->
        <section class="section-block">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined">history</span>
              Okuma Geçmişim
            </h2>
          </div>

          <div v-if="pastLoans.length === 0" class="state-message small">
            Henüz teslim edilmiş bir kitabınız yok.
          </div>

          <div v-else class="history-list">
            <div v-for="loan in pastLoans" :key="loan.id" class="history-item">
              <div class="history-icon">
                <span class="material-symbols-outlined">auto_stories</span>
              </div>
              <div class="history-info">
                <h4 class="history-title">{{ loan.bookTitle }}</h4>
                <span class="history-date">
                  Teslim edildi: {{ formatDate(loan.returnDate) }}
                </span>
              </div>
              <button class="btn-review" @click="openReviewModal(loan)">
                <span class="material-symbols-outlined">
                  {{ reviewByBookId[loan.bookId] ? 'edit' : 'rate_review' }}
                </span>
                {{ reviewByBookId[loan.bookId] ? 'Yorumu Düzenle' : 'Yorum Yaz' }}
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- Yorum Yaz / Düzenle Modalı -->
    <div v-if="reviewModal.open" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ reviewModal.existing ? 'Yorumu Düzenle' : 'Yorum Yaz' }}</h3>
          <button class="modal-close" @click="closeReviewModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-book-title">{{ reviewModal.bookTitle }}</p>

          <div class="rating-picker">
            <span
              v-for="star in 5"
              :key="star"
              class="material-symbols-outlined star"
              :class="{ filled: star <= reviewModal.rating }"
              @click="reviewModal.rating = star"
            >
              star
            </span>
          </div>

          <textarea
            v-model="reviewModal.comment"
            class="review-textarea"
            rows="4"
            placeholder="Bu kitap hakkında ne düşünüyorsun?"
          ></textarea>

          <p v-if="reviewModal.errorMsg" class="modal-error">
            {{ reviewModal.errorMsg }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeReviewModal">Vazgeç</button>
          <button
            class="btn-primary"
            :disabled="reviewModal.saving || reviewModal.rating === 0"
            @click="submitReview"
          >
            {{ reviewModal.saving ? 'Kaydediliyor...' : 'Gönder' }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { loanService } from '../services/loanService'
import { reviewService } from '../services/reviewService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(false)
const loans = ref([])
const reviews = ref([])

// bookId -> review objesi, hızlı erişim için lookup map
const reviewByBookId = computed(() => {
  const map = {}
  for (const r of reviews.value) {
    map[r.bookId] = r
  }
  return map
})

const activeLoans = computed(() =>
  loans.value.filter((l) => l.status !== 'Returned')
)
const pastLoans = computed(() =>
  loans.value.filter((l) => l.status === 'Returned')
)

function statusLabel(status) {
  if (status === 'Overdue') return 'Gecikti'
  if (status === 'Active') return 'Aktif'
  return status
}

function statusBadgeClass(status) {
  if (status === 'Overdue') return 'badge-error'
  return 'badge-primary'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function daysLate(dueDateStr) {
  const due = new Date(dueDateStr)
  const now = new Date()
  const diffMs = now - due
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

// --- Veri çekme: loans ve reviews paralel çekiliyor ---
async function fetchData() {
  loading.value = true
  error.value = false
  try {
    const [loansData, reviewsData] = await Promise.all([
      loanService.getMyLoans(),
      reviewService.getMyReviews(),
    ])
    loans.value = loansData
    reviews.value = reviewsData
  } catch (err) {
    console.error('Kitaplarım verileri yüklenemedi:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// --- Yorum modalı state ve fonksiyonları ---
const reviewModal = ref({
  open: false,
  bookId: null,
  bookTitle: '',
  existing: null, // düzenleniyorsa mevcut review objesi
  rating: 0,
  comment: '',
  saving: false,
  errorMsg: '',
})

function openReviewModal(loan) {
  const existing = reviewByBookId.value[loan.bookId] || null
  reviewModal.value = {
    open: true,
    bookId: loan.bookId,
    bookTitle: loan.bookTitle,
    existing,
    rating: existing ? existing.rating : 0,
    comment: existing ? existing.comment : '',
    saving: false,
    errorMsg: '',
  }
}

function closeReviewModal() {
  reviewModal.value.open = false
}

async function submitReview() {
  reviewModal.value.saving = true
  reviewModal.value.errorMsg = ''
  try {
    if (reviewModal.value.existing) {
      // Düzenleme: mevcut review'i günceller
      await reviewService.updateReview(reviewModal.value.existing.id, {
        rating: reviewModal.value.rating,
        comment: reviewModal.value.comment,
      })
    } else {
      // Yeni yorum oluşturur
      await reviewService.createReview({
        bookId: reviewModal.value.bookId,
        rating: reviewModal.value.rating,
        comment: reviewModal.value.comment,
      })
    }
    // Listeyi güncel tutmak için yorumları yeniden çekiyoruz
    reviews.value = await reviewService.getMyReviews()
    closeReviewModal()
  } catch (err) {
    console.error('Yorum kaydedilemedi:', err)
    reviewModal.value.errorMsg = 'Yorum kaydedilirken bir hata oluştu.'
  } finally {
    reviewModal.value.saving = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.mybooks-layout {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 4px;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 15px;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.count-badge {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}

.active-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.active-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 16px;
  border-left: 4px solid transparent;
  transition: box-shadow 0.15s;
}

.active-card:hover {
  box-shadow: var(--shadow-hover);
}

.active-card.is-overdue {
  border-left-color: var(--color-error, #b83230);
}

.active-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.active-body {
  flex: 1;
  min-width: 0;
}

.active-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.active-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  text-transform: uppercase;
}

.badge-primary {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}

.badge-error {
  background-color: rgba(184, 50, 48, 0.12);
  color: var(--color-error, #b83230);
}

.active-dates {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.date-row .material-symbols-outlined {
  font-size: 16px;
}

.text-error {
  color: var(--color-error, #b83230);
  font-weight: 700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-icon {
  width: 44px;
  height: 56px;
  border-radius: var(--radius-md);
  background-color: var(--color-outline-variant);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px;
}

.history-date {
  font-size: 13px;
  color: var(--color-text-muted);
}

.btn-review {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.btn-review:hover {
  opacity: 0.9;
}

.state-message {
  text-align: center;
  padding: 64px 0;
  color: var(--color-text-muted);
  font-size: 16px;
}

.state-message.small {
  padding: 24px 0;
  font-size: 14px;
}

.state-message.error {
  color: var(--color-error, #b83230);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(46, 50, 48, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  box-shadow: var(--shadow-hover);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.modal-header h3 {
  font-family: var(--font-heading);
  font-size: 20px;
  margin: 0;
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
}

.modal-body {
  padding: 20px 24px;
}

.modal-book-title {
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px;
}

.rating-picker {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.rating-picker .star {
  font-size: 28px;
  color: var(--color-outline-variant);
  cursor: pointer;
  transition: color 0.1s;
}

.rating-picker .star.filled {
  color: var(--color-tertiary);
  font-variation-settings: 'FILL' 1;
}

.review-textarea {
  width: 100%;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
}

.review-textarea:focus {
  outline: 2px solid var(--color-primary-soft);
  border-color: var(--color-primary);
}

.modal-error {
  color: var(--color-error, #b83230);
  font-size: 13px;
  margin: 8px 0 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-outline-variant);
}

.btn-secondary {
  background: none;
  border: 1px solid var(--color-outline-variant);
  color: var(--color-text-muted);
  padding: 10px 18px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>