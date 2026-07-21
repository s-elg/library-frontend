<template>
  <div class="home-page">
    <header class="home-header">
      <h1>Hoş Geldin{{ authStore.fullName ? ', ' + authStore.fullName : '' }}</h1>
      <button class="btn-secondary" @click="handleLogout">Çıkış Yap</button>
    </header>

    <p class="placeholder-text">
      Burası ana sayfa. Kitap listeleme ekranı yakında burada olacak.
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-page {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: rgba(74, 124, 89, 0.08);
}

.placeholder-text {
  color: var(--color-text-muted);
}
</style>