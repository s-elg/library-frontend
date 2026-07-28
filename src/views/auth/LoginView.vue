<template>
  <AuthLayout
    title="Bilginin Kökleri"
    subtitle="Geçmişin bilgeliği ile geleceği keşfedin. Hesabına giriş yaparak okuma serüvenine devam et."
  >
    <div class="form-header">
      <h2>Tekrar Hoş Geldin</h2>
      <p>Hesabına giriş yap</p>
    </div>

    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <label for="email">E-posta Adresi</label>
        <div class="input-wrapper">
          <span class="material-symbols-outlined">mail</span>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="ornek@mail.com"
            required
          />
        </div>
      </div>

      <div class="input-group">
        <label for="password">Şifre</label>
        <div class="input-wrapper">
          <span class="material-symbols-outlined">lock</span>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        <span>{{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}</span>
      </button>
    </form>

    <p class="switch-link">
      Hesabın yok mu?
      <router-link to="/register">Kayıt Ol</router-link>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value = err.response.data.message || 'E-posta veya şifre hatalı.'
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