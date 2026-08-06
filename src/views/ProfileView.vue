<template>
  <MainLayout active="profile" :show-search="false" @logout="handleLogout">
    <main class="profile-page">
      <header class="page-header">
        <h1>Profil Ayarları</h1>
        <p>Kişisel bilgilerini, güvenlik ayarlarını ve ceza kayıtlarını buradan yönetebilirsin.</p>
      </header>

      <div class="profile-grid">
        <!-- Sol kolon: Kişisel Bilgiler + Güvenlik -->
        <div class="profile-main">
          <!-- Kişisel Bilgiler -->
          <section class="card">
            <h2 class="card-title">
              <span class="material-symbols-outlined">person</span>
              Kişisel Bilgiler
            </h2>

            <form class="form" @submit.prevent="handleProfileSubmit">
              <div class="field">
                <label for="fullName">Ad Soyad</label>
                <input id="fullName" v-model="profileForm.fullName" type="text" required />
              </div>
              <div class="field">
                <label for="email">Email Adresi</label>
                <input id="email" v-model="profileForm.email" type="email" required />
              </div>

              <p v-if="profileMessage" class="form-message" :class="profileMessageType">
                {{ profileMessage }}
              </p>

              <button type="submit" class="btn-primary" :disabled="profileLoading">
                {{ profileLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </form>
          </section>

          <!-- Güvenlik / Şifre Değiştirme -->
          <section class="card">
            <h2 class="card-title">
              <span class="material-symbols-outlined">shield_lock</span>
              Güvenlik
            </h2>

            <form class="form" @submit.prevent="handlePasswordSubmit">
              <div class="field">
                <label for="currentPassword">Mevcut Şifre</label>
                <input id="currentPassword" v-model="passwordForm.currentPassword" type="password" required />
              </div>
              <div class="field">
                <label for="newPassword">Yeni Şifre</label>
                <input id="newPassword" v-model="passwordForm.newPassword" type="password" required minlength="8" />
              </div>
              <div class="field">
                <label for="confirmPassword">Yeni Şifre (Tekrar)</label>
                <input id="confirmPassword" v-model="passwordForm.confirmPassword" type="password" required minlength="8" />
              </div>

              <p v-if="passwordError" class="form-message error">{{ passwordError }}</p>

              <button type="submit" class="btn-secondary" :disabled="passwordLoading">
                {{ passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}
              </button>
              <p class="form-hint">Şifreni değiştirdikten sonra güvenlik nedeniyle otomatik çıkış yapılacaksın.</p>
            </form>
          </section>
        </div>

        <!-- Sağ kolon: Cezalarım -->
        <aside class="card penalties-card">
          <h2 class="card-title">
            <span class="material-symbols-outlined">warning</span>
            Cezalarım
          </h2>

          <div v-if="penaltiesLoading" class="penalties-empty">Yükleniyor...</div>

          <div v-else-if="penalties.length === 0" class="penalties-empty">
            <span class="material-symbols-outlined">task_alt</span>
            <p>Hiç ceza kaydın yok.</p>
          </div>

          <ul v-else class="penalty-list">
            <li v-for="penalty in penalties" :key="penalty.id" class="penalty-item">
              <div class="penalty-item-header">
                <span class="penalty-status" :class="statusClass(penalty.status)">
                  {{ penalty.status }}
                </span>
                <span class="penalty-date">{{ formatDate(penalty.createdDate) }}</span>
              </div>
              <p class="penalty-reason">{{ penalty.reason }}</p>
              <p class="penalty-end-date">
                Askı bitiş tarihi: <strong>{{ formatDate(penalty.suspensionEndDate) }}</strong>
              </p>
            </li>
          </ul>
        </aside>
      </div>
    </main>
  </MainLayout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getMyPenalties } from '../services/penaltyService'
import MainLayout from '../components/layout/MainLayout.vue'
import TopNavBar from '../components/layout/TopNavBar.vue'

const router = useRouter()
const authStore = useAuthStore()

// --- Kişisel Bilgiler Formu ---
const profileForm = reactive({
  fullName: authStore.fullName || '',
  email: authStore.email || '',
})
const profileLoading = ref(false)
const profileMessage = ref('')
const profileMessageType = ref('success') // 'success' | 'error'

async function handleProfileSubmit() {
  profileLoading.value = true
  profileMessage.value = ''
  try {
    await authStore.updateProfile({
      fullName: profileForm.fullName,
      email: profileForm.email,
    })
    profileMessageType.value = 'success'
    profileMessage.value = 'Profil bilgilerin güncellendi.'
  } catch (error) {
    profileMessageType.value = 'error'
    profileMessage.value = error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.'
  } finally {
    profileLoading.value = false
  }
}

// --- Şifre Değiştirme Formu ---
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordLoading = ref(false)
const passwordError = ref('')

async function handlePasswordSubmit() {
  passwordError.value = ''

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Yeni şifreler birbiriyle eşleşmiyor.'
    return
  }

  passwordLoading.value = true
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    // changePassword başarılı olunca store zaten oturumu kapattı, login'e yönlendir
    router.push({ name: 'login' })
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'Şifre güncellenemedi.'
  } finally {
    passwordLoading.value = false
  }
}

// --- Cezalarım ---
const penalties = ref([])
const penaltiesLoading = ref(true)

function statusClass(status) {
  return status?.toLowerCase() === 'active' ? 'status-active' : 'status-resolved'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

async function loadPenalties() {
  penaltiesLoading.value = true
  try {
    penalties.value = await getMyPenalties()
  } catch (error) {
    console.error('Cezalar yüklenemedi:', error)
  } finally {
    penaltiesLoading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  loadPenalties()
})
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.page-header h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 8px;
}

.page-header p {
  color: var(--color-text-muted);
  margin-bottom: 32px;
}

.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-soft);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 20px;
}

.card-title .material-symbols-outlined {
  color: var(--color-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.field input {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-primary-soft, transparent);
  color: var(--color-text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.field input:focus {
  border-color: var(--color-primary);
}

.btn-primary,
.btn-secondary {
  align-self: flex-start;
  border-radius: var(--radius-pill);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-message {
  font-size: 0.85rem;
  margin: 0;
}

.form-message.success {
  color: var(--color-primary);
}

.form-message.error,
.error {
  color: var(--color-error, #b83230);
}

.form-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Cezalarım */
.penalties-card {
  display: flex;
  flex-direction: column;
}

.penalties-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--color-text-muted);
  text-align: center;
}

.penalties-empty .material-symbols-outlined {
  font-size: 32px;
  color: var(--color-primary);
}

.penalty-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.penalty-item {
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 16px;
}

.penalty-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.penalty-status {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
}

.penalty-status.status-active {
  background-color: rgba(184, 50, 48, 0.12);
  color: var(--color-error, #b83230);
}

.penalty-status.status-resolved {
  background-color: var(--color-primary-soft, rgba(74, 124, 89, 0.12));
  color: var(--color-primary);
}

.penalty-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.penalty-reason {
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 4px;
}

.penalty-end-date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* --- Responsive: tablet ve üstü --- */
@media (min-width: 900px) {
  .profile-grid {
    flex-direction: row;
    align-items: flex-start;
  }

  .profile-main {
    flex: 2;
  }

  .penalties-card {
    flex: 1;
    position: sticky;
    top: 96px;
  }
}
</style>