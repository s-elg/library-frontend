<template>
  <AuthLayout
    title="Köklerine Dön"
    subtitle="Kütüphanemizin bir parçası ol. Doğanın huzuruyla harmanlanmış bir okuma deneyimine adım at."
  >
    <div class="form-header">
      <h2>Yeni Hesap Oluştur</h2>
      <p>Kütüphaneye katılmak için bilgilerini gir</p>
    </div>

    <form @submit.prevent="handleRegister">
      <div class="input-group">
        <label for="fullName">Ad Soyad</label>
        <div class="input-wrapper">
          <span class="material-symbols-outlined">person</span>
          <input id="fullName" v-model="fullName" type="text" placeholder="Örn: Selin Yılmaz" required />
        </div>
      </div>

      <div class="input-group">
        <label for="email">E-posta Adresi</label>
        <div class="input-wrapper">
          <span class="material-symbols-outlined">mail</span>
          <input id="email" v-model="email" type="email" placeholder="ornek@terra.com" required />
        </div>
      </div>

      <div class="input-row">
        <div class="input-group">
          <label for="password">Şifre</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined">lock</span>
            <input id="password" v-model="password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Şifre Tekrar</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined">shield_lock</span>
            <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="••••••••" required />
          </div>
        </div>
      </div>

      <label class="terms-row">
        <input type="checkbox" v-model="termsAccepted" required />
        <span>
          <router-link to="/terms">Kullanım Koşullarını</router-link> ve
          <router-link to="/privacy">Gizlilik Politikası'nı</router-link> okudum, kabul ediyorum.
        </span>
      </label>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        <span>{{ loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol' }}</span>
      </button>
    </form>

    <p class="switch-link">
      Zaten hesabın var mı?
      <router-link to="/login">Giriş Yap</router-link>
    </p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../components/layout/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const termsAccepted = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  // Backend'e gitmeden önce istemci tarafı kontrolü:
  // confirmPassword ve termsAccepted backend DTO'sunda yok, sadece UX için.
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Şifreler eşleşmiyor.'
    return
  }

  loading.value = true
  try {
    await authStore.register({
      fullName: fullName.value,
      email: email.value,
      password: password.value,
    })
    router.push('/')
  } catch (err) {
    if (err.response?.status === 400 && err.response.data && typeof err.response.data === 'object') {
      const allMessages = Object.values(err.response.data).flat()
      errorMessage.value = allMessages.join(' ')
    } else if (err.response?.status === 409) {
      errorMessage.value = err.response.data.message || 'Bu e-posta zaten kayıtlı.'
    } else {
      errorMessage.value = 'Bir hata oluştu, lütfen tekrar dene.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-header {
  margin-bottom: 28px;
}

.form-header h2 {
  font-size: 1.75rem;
  margin: 0 0 4px;
}

.form-header p {
  color: var(--color-text-muted);
  margin: 0;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .material-symbols-outlined {
  position: absolute;
  left: 14px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 13px 14px 13px 44px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-background);
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 8px 0 18px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.terms-row input {
  margin-top: 3px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.terms-row a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.error-text {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-bottom: 12px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--shadow-soft);
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.switch-link {
  text-align: center;
  margin-top: 24px;
  font-size: 0.9rem;
  padding-top: 20px;
  border-top: 1px solid var(--color-outline-variant);
}

.switch-link a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
</style>