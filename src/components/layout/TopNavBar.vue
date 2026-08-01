<template>
  <header class="top-nav">
    <router-link :to="{ name: 'Catalog' }" class="logo-container">
      <span class="material-symbols-outlined logo-icon">eco</span>
      <span class="logo-text">Terra Library</span>
    </router-link>

    <nav v-if="authStore.isAuthenticated" class="nav-links">
      <router-link :to="{ name: 'Catalog' }" class="nav-item" :class="{ active: active === 'catalog' }">
        Catalog
      </router-link>
      <button class="nav-item" :class="{ active: active === 'myBooks' }" disabled title="Yakında">
        My Books
      </button>
      <button class="nav-item" :class="{ active: active === 'profile' }" disabled title="Yakında">
        Profile
      </button>
    </nav>

    <div class="header-actions">
      <div v-if="showSearch" class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          :value="searchTerm"
          class="header-search-input"
          type="text"
          placeholder="Kitap, yazar veya ISBN ara..."
          @input="$emit('update:searchTerm', $event.target.value)"
        />
      </div>

      <button v-if="authStore.isAuthenticated" class="btn-signout" @click="$emit('logout')">
        <span class="material-symbols-outlined signout-icon">logout</span> Sign Out
      </button>
      <router-link v-else :to="{ name: 'login' }" class="btn-login">
        <span class="material-symbols-outlined login-icon">login</span> Giriş Yap
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

defineProps({
  active: {
    type: String,
    default: 'catalog',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchTerm: {
    type: String,
    default: '',
  },
})

defineEmits(['update:searchTerm', 'logout'])

const authStore = useAuthStore()
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  width: 100%;
  background-color: var(--color-surface, #ffffff);
  border-bottom: 1px solid var(--color-outline-variant);
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 28px;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-item {
  background: none;
  border: none;
  font-size: 15px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-item:disabled {
  cursor: default;
  opacity: 0.5;
}

.nav-item:not(:disabled):hover {
  color: var(--color-text);
}

.nav-item.active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom-color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--color-outline-variant);
  border-radius: 999px;
  padding: 8px 16px;
  gap: 8px;
}

.search-icon {
  font-size: 18px;
  color: var(--color-text-muted);
}

.header-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 200px;
  color: var(--color-text);
}

.header-search-input::placeholder {
  color: var(--color-text-muted);
}

.btn-signout,
.btn-login {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-signout {
  background-color: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-outline-variant);
}

.btn-signout:hover {
  background-color: rgba(74, 124, 89, 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-login {
  background-color: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

.btn-login:hover {
  opacity: 0.9;
}

.signout-icon,
.login-icon {
  font-size: 18px;
}
</style>