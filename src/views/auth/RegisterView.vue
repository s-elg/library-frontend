<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Hesap Oluştur</h1>
      <p class="subtitle">Kütüphaneye katıl</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullName">Ad Soyad</label>
          <input id="fullName" v-model="fullName" type="text" required />
        </div>

        <div class="form-group">
          <label for="email">E-posta</label>
          <input id="email" v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label for="password">Şifre</label>
          <input id="password" v-model="password" type="password" required />
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol' }}
        </button>
      </form>

      <p class="switch-link">
        Zaten hesabın var mı?
        <router-link to="/login">Giriş Yap</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''
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
      // ValidationFilter'ın döndüğü format: { "Password": ["..."], "Email": ["..."] }
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
/* LoginView.vue ile aynı stiller — istersen bunu ortak bir CSS dosyasına çıkarabiliriz */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}
.auth-card {
  background-color: var(--color-surface);
  padding: var(--space-card-padding);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  width: 100%;
  max-width: 400px;
}
h1 { margin: 0 0 4px; font-size: 1.75rem; }
.subtitle { color: var(--color-text-muted); margin-bottom: 24px; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; }
input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-background);
  font-family: var(--font-body);
  font-size: 1rem;
}
input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.15);
}
.error-text { color: var(--color-error); font-size: 0.875rem; margin-bottom: 12px; }
.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
}
.btn-primary:hover:not(:disabled) { background-color: var(--color-primary-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.switch-link { text-align: center; margin-top: 20px; font-size: 0.9rem; }
.switch-link a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
</style>