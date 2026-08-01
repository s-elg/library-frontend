<template>
  <div class="auth-page">
    <div class="auth-shell">

      <!-- ===================== SABİT MARKA PANELİ (kaymaz) ===================== -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 6 7 6 13C6 16.3 8.7 19 12 19C15.3 19 18 16.3 18 13C18 7 12 2 12 2Z" stroke="currentColor" stroke-width="1.4"/>
              <path d="M12 19V22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              <path d="M9 13C9 13 10 15 12 15C14 15 15 13 15 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="brand-title" @click="router.push({ name: 'Catalog' })">Terra Library</h1>
          <p class="brand-tag">Bilgiye kök salan bir topluluk.</p>

          <transition name="fade-swap" mode="out-in">
            <div v-if="mode === 'login'" key="to-register" class="brand-switch">
              <p>Henüz hesabın yok mu?</p>
              <button type="button" class="ghost-btn" @click="switchMode('register')">
                Kayıt Ol
              </button>
            </div>
            <div v-else key="to-login" class="brand-switch">
              <p>Zaten bir hesabın var mı?</p>
              <button type="button" class="ghost-btn" @click="switchMode('login')">
                Giriş Yap
              </button>
            </div>
          </transition>
        </div>

        <!-- Organik kök deseni (dekoratif, imza öğesi) -->
        <svg class="root-decoration" viewBox="0 0 200 400" preserveAspectRatio="none">
          <path d="M0,0 C40,60 10,120 50,180 C90,240 30,300 60,400 L0,400 Z" fill="rgba(255,255,255,0.06)"/>
          <path d="M0,50 C60,100 20,160 70,220 C110,270 50,340 80,400 L0,400 Z" fill="rgba(255,255,255,0.04)"/>
        </svg>
      </div>

      <!-- Sınırdaki organik kavis (SVG ile "kök ucu" efekti) -->
      <svg class="edge-curve" viewBox="0 0 60 400" preserveAspectRatio="none">
        <path
          class="edge-path"
          :d="mode === 'login'
            ? 'M0,0 C40,80 10,160 35,200 C10,240 40,320 0,400 L60,400 L60,0 Z'
            : 'M0,0 C20,80 45,160 25,200 C45,240 20,320 0,400 L60,400 L60,0 Z'"
        />
      </svg>

      <!-- ===================== KAYAN FORM VİTRİNİ ===================== -->
      <div class="form-viewport">
        <div class="form-track" :class="{ 'is-register': mode === 'register' }">

          <!-- ---- GİRİŞ FORMU ---- -->
          <section class="form-panel">
            <h2 class="form-title">Tekrar Hoş Geldin</h2>
            <p class="form-subtitle">Hesabına giriş yaparak okumaya devam et.</p>

            <form class="auth-form" @submit.prevent="handleLogin">
              <label class="field">
                <span class="field-label">E-posta</span>
                <input
                  v-model="loginForm.email"
                  type="email"
                  autocomplete="email"
                  placeholder="ornek@terra.com"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">Şifre</span>
                <input
                  v-model="loginForm.password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </label>

              <div class="field-row">
                <label class="checkbox-field">
                  <input v-model="loginForm.rememberMe" type="checkbox" />
                  <span>Beni hatırla</span>
                </label>
                <a href="#" class="link-muted">Şifremi unuttum</a>
              </div>

              <p v-if="loginErrors.length" class="error-box">
                <span v-for="(err, i) in loginErrors" :key="i">{{ err }}</span>
              </p>

              <button type="submit" class="primary-btn" :disabled="loginLoading">
                {{ loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
              </button>
            </form>
          </section>

          <!-- ---- KAYIT FORMU ---- -->
          <section class="form-panel">
            <h2 class="form-title">Aramıza Katıl</h2>
            <p class="form-subtitle">Yeni bir hesap oluşturarak kütüphaneyi keşfet.</p>

            <form class="auth-form" @submit.prevent="handleRegister">
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">Ad</span>
                  <input v-model="registerForm.firstName" type="text" required />
                </label>
                <label class="field">
                  <span class="field-label">Soyad</span>
                  <input v-model="registerForm.lastName" type="text" required />
                </label>
              </div>

              <label class="field">
                <span class="field-label">E-posta</span>
                <input
                  v-model="registerForm.email"
                  type="email"
                  autocomplete="email"
                  placeholder="ornek@terra.com"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">Şifre</span>
                <input
                  v-model="registerForm.password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="En az 8 karakter"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">Şifre Tekrar</span>
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                />
              </label>

              <p v-if="registerErrors.length" class="error-box">
                <span v-for="(err, i) in registerErrors" :key="i">{{ err }}</span>
              </p>

              <button type="submit" class="primary-btn" :disabled="registerLoading">
                {{ registerLoading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol' }}
              </button>
            </form>
          </section>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Mevcut Pinia auth store'un

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Sayfa /login ile açılırsa 'login', /register ile açılırsa 'register' modunda başlar
const mode = ref(route.meta?.initialMode === 'register' ? 'register' : 'login')

function switchMode(target) {
  mode.value = target
  // URL'i de senkron tutmak istersen (opsiyonel):
  router.replace({ path: target === 'login' ? '/login' : '/register' })
}

// ---------- LOGIN ----------
const loginForm = reactive({ email: '', password: '', rememberMe: false })
const loginErrors = ref([])
const loginLoading = ref(false)

async function handleLogin() {
  loginErrors.value = []
  loginLoading.value = true
  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password,
    })
    router.push('/')
  } catch (err) {
    // FluentValidation hataları genelde err.response.data.errors { Field: [msg,...] } şeklinde gelir
    const apiErrors = err?.response?.data?.errors
    if (apiErrors) {
      loginErrors.value = Object.values(apiErrors).flat()
    } else {
      loginErrors.value = [err?.response?.data?.message || 'Giriş başarısız. Bilgilerini kontrol et.']
    }
  } finally {
    loginLoading.value = false
  }
}

// ---------- REGISTER ----------
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const registerErrors = ref([])
const registerLoading = ref(false)

async function handleRegister() {
  registerErrors.value = []

  if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.value = ['Şifreler eşleşmiyor.']
    return
  }

  registerLoading.value = true
  try {
    await authStore.register({
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      password: registerForm.password,
    })
    // Kayıt sonrası otomatik login moduna geç
    switchMode('login')
  } catch (err) {
    const apiErrors = err?.response?.data?.errors
    if (apiErrors) {
      registerErrors.value = Object.values(apiErrors).flat()
    } else {
      registerErrors.value = [err?.response?.data?.message || 'Kayıt başarısız oldu.']
    }
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
/* ===================== DESIGN.MD TOKENLARI ===================== */
.auth-page {
  --color-primary: #4a7c59;
  --color-primary-dark: #3a6347;
  --color-background: #faf6f0;
  --color-tertiary: #705c30;
  --color-on-surface: #2e3230;
  --color-on-surface-variant: #4a4e4a;
  --color-outline-variant: #c4c8bc;
  --color-surface: #ffffff;
  --font-headline: 'Literata', serif;
  --font-body: 'Nunito Sans', sans-serif;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  font-family: var(--font-body);
  color: var(--color-on-surface);
  padding: 24px;
}

.auth-shell {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 960px;
  height: 600px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(46, 50, 48, 0.12);
  background: var(--color-surface);
}

/* ===================== SABİT MARKA PANELİ ===================== */
.brand-panel {
  position: relative;
  width: 38%;
  flex-shrink: 0;
  background: linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 48px 40px;
  overflow: hidden;
}

.root-decoration {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 2;
}

.brand-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.brand-badge svg { width: 28px; height: 28px; }

.brand-title {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px;
  cursor: pointer; /* Fare imlecini tıklanabilir (el) işaretine çevirir */
  transition: opacity 0.2s ease; /* Hover efekti için yumuşak bir geçiş */
}

/* Üzerine gelindiğinde hafifçe saydamlaşarak tıklanabilir hissi verir */
.brand-title:hover {
  opacity: 0.85; 
}

.brand-tag {
  font-size: 0.95rem;
  opacity: 0.85;
  margin: 0 0 40px;
  line-height: 1.6;
}

.brand-switch p {
  font-size: 0.9rem;
  opacity: 0.85;
  margin: 0 0 14px;
}

.ghost-btn {
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  padding: 10px 24px;
  border-radius: 999px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}
.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
}

.fade-swap-enter-active,
.fade-swap-leave-active {
  transition: opacity 0.2s ease;
}
.fade-swap-enter-from,
.fade-swap-leave-to {
  opacity: 0;
}

/* ===================== SINIRDAKİ ORGANİK KAVİS (imza öğesi) ===================== */
.edge-curve {
  position: absolute;
  left: calc(38% - 30px);
  top: 0;
  width: 60px;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}
.edge-path {
  fill: var(--color-surface);
  transition: d 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}

/* ===================== KAYAN FORM VİTRİNİ ===================== */
.form-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.form-track {
  display: flex;
  width: 200%;
  height: 100%;
  transform: translateX(0%);
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}
.form-track.is-register {
  transform: translateX(-50%);
}

.form-panel {
  width: 50%;
  flex-shrink: 0;
  padding: 56px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  font-family: var(--font-headline);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-on-surface);
}

.form-subtitle {
  color: var(--color-on-surface-variant);
  margin: 0 0 32px;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-on-surface-variant);
}

.field input {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-background);
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-on-surface);
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.field input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.15);
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.link-muted {
  color: var(--color-tertiary);
  text-decoration: none;
  font-weight: 600;
}
.link-muted:hover { text-decoration: underline; }

.error-box {
  background: #ffdad8;
  color: #690005;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}

.primary-btn {
  margin-top: 8px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}
.primary-btn:hover:not(:disabled) { background: var(--color-primary-dark); }
.primary-btn:active:not(:disabled) { transform: scale(0.98); }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ===================== MOBİL ===================== */
@media (max-width: 720px) {
  .auth-shell {
    flex-direction: column;
    height: auto;
    max-width: 420px;
  }
  .brand-panel { width: 100%; padding: 32px; }
  .edge-curve { display: none; }
  .form-track { width: 200%; }
  .form-panel { padding: 32px; }
  .field-grid { grid-template-columns: 1fr; }
}
</style>