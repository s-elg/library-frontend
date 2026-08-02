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

        <svg class="root-decoration" viewBox="0 0 200 400" preserveAspectRatio="none">
          <path d="M0,0 C40,60 10,120 50,180 C90,240 30,300 60,400 L0,400 Z" fill="rgba(255,255,255,0.06)"/>
          <path d="M0,50 C60,100 20,160 70,220 C110,270 50,340 80,400 L0,400 Z" fill="rgba(255,255,255,0.04)"/>
        </svg>
      </div>

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

              <!-- ŞİFRE ALANI: input + canlı kural listesi (popover) -->
              <div class="field password-field">
                <span class="field-label">Şifre</span>
                <input
                  v-model="registerForm.password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="En az 6 karakter"
                  required
                  @focus="passwordFocused = true"
                  @blur="passwordFocused = false"
                />

                

                <!-- Popover: input'un altına mutlak konumla oturur, form akışını etkilemez -->
                <transition name="fade-swap">
                  <ul v-if="showPasswordRules" class="password-rules">
                    <li
                      v-for="(rule, i) in passwordRules"
                      :key="i"
                      :class="{ valid: rule.valid }"
                    >
                      <span class="rule-icon">
                        <svg v-if="rule.valid" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
                        </svg>
                      </span>
                      {{ rule.label }}
                    </li>
                  </ul>
                </transition>
              </div>

              <button type="submit" class="primary-btn" :disabled="registerLoading">
                {{ registerLoading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol' }}
              </button>
            </form>
          </section>

        </div>
      </div>

    </div>

    <!-- ===================== TOAST BİLDİRİMİ ===================== -->
    <Teleport to="body">
      <transition name="toast-slide">
        <div v-if="toast.show" class="toast-notification" :class="toast.type">
          <span class="toast-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 8V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="0.9" fill="currentColor"/>
            </svg>
          </span>
          <div class="toast-content">
            <p v-for="(err, i) in toast.messages" :key="i">{{ err }}</p>
          </div>
          <button type="button" class="toast-close" @click="closeToast" aria-label="Kapat">×</button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref(route.meta?.initialMode === 'register' ? 'register' : 'login')

function switchMode(target) {
  mode.value = target
  router.replace({ path: target === 'login' ? '/login' : '/register' })
}

// ---------- TOAST BİLDİRİM SİSTEMİ ----------
const toast = reactive({ show: false, messages: [], type: 'error' })
let toastTimer = null

function showToast(messages, type = 'error') {
  toast.messages = messages
  toast.type = type
  toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.show = false
  }, 5000)
}

function closeToast() {
  toast.show = false
  clearTimeout(toastTimer)
}

// C# / ASP.NET Core'dan gelen çeşitli hata formatlarını çözümleyen yardımcı fonksiyon
function extractApiErrors(err) {
  // 1. Sunucuya hiç ulaşılamadıysa (Network Error)
  if (!err.response) return ['Sunucuya ulaşılamıyor, bağlantınızı kontrol edin.'];

  const data = err.response.data;

  // 2. .NET Core Varsayılan (ProblemDetails) formatı: { "errors": { "Email": ["Hata 1", "Hata 2"] } }
  if (data && data.errors) {
    if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      // İç içe dizileri düzleştirir
      return Object.values(data.errors).flat();
    }
    // Dizi olarak geliyorsa (bazı custom filter'lar)
    if (Array.isArray(data.errors)) {
      // Eğer [{ propertyName: "Email", errorMessage: "Hata" }] şeklindeyse
      if (typeof data.errors[0] === 'object' && data.errors[0].errorMessage) {
        return data.errors.map(e => e.errorMessage);
      }
      return data.errors; // Zaten düz string dizisiyse
    }
  }

  // 3. Büyük harfle "Errors" gelme ihtimali
  if (data && data.Errors) {
    if (typeof data.Errors === 'object') {
      return Object.values(data.Errors).flat();
    }
  }

  // 4. Validasyon hatası değil de genel bir kural hatasıysa (Örn: "Bu email zaten kayıtlı")
  if (data && data.message) return [data.message];
  if (data && data.Message) return [data.Message];

  // 5. Hiçbirine uymuyorsa varsayılan mesaj
  return ['İşlem sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.'];
}

// ---------- LOGIN ----------
const loginForm = reactive({ email: '', password: '', rememberMe: false })
const loginLoading = ref(false)

async function handleLogin() {
  loginLoading.value = true
  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password,
    })
    router.push('/')
  } catch (err) {
    // SADECE BURASI DEĞİŞTİ
    const errorMessages = extractApiErrors(err)
    showToast(errorMessages)
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
const registerLoading = ref(false)

// Şifre inputuna odaklanıldığında true olur, boşken ve focus kaybolunca listeyi gizler
const passwordFocused = ref(false)

// Backend'deki FluentValidation kurallarının birebir frontend karşılığı:
// NotEmpty + MinimumLength(6) + Matches("[A-Z]") + Matches("[0-9]")
const passwordRules = computed(() => {
  const pwd = registerForm.password
  return [
    { label: 'En az 6 karakter', valid: pwd.length >= 6 },
    { label: 'En az bir büyük harf (A-Z)', valid: /[A-Z]/.test(pwd) },
    { label: 'En az bir rakam (0-9)', valid: /[0-9]/.test(pwd) },
  ]
})

// Tüm kurallar sağlandı mı — submit öncesi kontrol için
const isPasswordValid = computed(() => passwordRules.value.every((r) => r.valid))

// Liste ne zaman görünsün: 
// Input focus'tayken VEYA (içinde yazı varsa VE kuralların hepsi henüz sağlanmadıysa)
const showPasswordRules = computed(
  () => (passwordFocused.value || registerForm.password.length > 0) && !isPasswordValid.value
)

async function handleRegister() {
  // Şifre kuralları sağlanmadan backend'e istek atmayalım
  if (!isPasswordValid.value) {
    showToast(['Lütfen şifre kurallarının tamamını sağlayın.'])
    passwordFocused.value = true
    return
  }

  registerLoading.value = true
  try {
    await authStore.register({
      fullName: `${registerForm.firstName.trim()} ${registerForm.lastName.trim()}`,
      email: registerForm.email,
      password: registerForm.password,
    })
    showToast(['Kayıt başarılı! Şimdi giriş yapabilirsin.'], 'success')
    switchMode('login')
  } catch (err) {
    const errorMessages = extractApiErrors(err)
    showToast(errorMessages)
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
  --color-error: #b83230;
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
  min-height: 600px; /* SABİT YÜKSEKLİĞİ KALDIRIP MİNİMUM YÜKSEKLİK YAPTIK */
  height: auto;      /* İÇERİK UZADIKÇA KUTUNUN ESNEMESİNE İZİN VERDİK */
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(46, 50, 48, 0.12);
  background: var(--color-surface);
}

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

.brand-content { position: relative; z-index: 2; }

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
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.brand-title:hover { opacity: 0.85; }

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

.fade-swap-enter-active, .fade-swap-leave-active { transition: opacity 0.2s ease; }
.fade-swap-enter-from, .fade-swap-leave-to { opacity: 0; }

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

.form-viewport { position: relative; flex: 1; overflow: hidden; }

.form-track {
  display: flex;
  width: 200%;
  height: 100%;
  transform: translateX(0%);
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}
.form-track.is-register { transform: translateX(-50%); }

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

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

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

.link-muted { color: var(--color-tertiary); text-decoration: none; font-weight: 600; }
.link-muted:hover { text-decoration: underline; }

/* Şifre inputunu saran wrapper — popover'ın referans noktası */
.password-field {
  position: relative;
}

/* ===================== ŞİFRE KURAL LİSTESİ (POPOVER) ===================== */
/* Artık document flow'da değil -> form yüksekliğini etkilemiyor,
   input'un hemen altına mutlak konumla "asılıyor" */
.password-rules {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;

  list-style: none;
  margin: 0;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(46, 50, 48, 0.12);

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.password-rules li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-error);
  transition: color 0.25s ease;
}

.password-rules li.valid {
  color: var(--color-primary);
}

.rule-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.rule-icon svg { width: 100%; height: 100%; }

/* ===================== SUBMIT BUTONU ===================== */
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

/* ===================== TOAST BİLDİRİMİ ===================== */
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 360px;
  background: #ffffff;
  border-left: 4px solid #b83230;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 8px 30px rgba(46, 50, 48, 0.15);
  font-family: 'Nunito Sans', sans-serif;
}
.toast-notification.success { border-left-color: #4a7c59; }

.toast-icon { flex-shrink: 0; margin-top: 2px; color: #b83230; }
.toast-notification.success .toast-icon { color: #4a7c59; }
.toast-icon svg { width: 20px; height: 20px; }

.toast-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.toast-content p { margin: 0; font-size: 0.85rem; line-height: 1.4; color: #2e3230; }

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  color: #4a4e4a;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.toast-close:hover { color: #2e3230; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(30px); }

/* ===================== MOBİL ===================== */
@media (max-width: 720px) {
  .auth-shell { flex-direction: column; height: auto; max-width: 420px; }
  .brand-panel { width: 100%; padding: 32px; }
  .edge-curve { display: none; }
  .form-track { width: 200%; }
  .form-panel { padding: 32px; }
  .field-grid { grid-template-columns: 1fr; }

  .toast-notification { left: 16px; right: 16px; top: 16px; max-width: none; }
}
</style>