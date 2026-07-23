<template>
  <header class="top-nav">
    <div class="logo-container">
      <span class="logo-icon">🌿</span>
      <span class="logo-text">Terra Library</span>
    </div>

    <nav class="nav-links">
      <router-link :to="{ name: 'Home' }" class="nav-item" :class="{ active: active === 'catalog' }">
        Catalog
      </router-link>
      <!-- Bu rotalar henüz oluşturulmadı, ileride eklenince router-link'e çevrilecek -->
      <button class="nav-item" :class="{ active: active === 'myBooks' }" disabled title="Yakında">
        My Books
      </button>
      <button class="nav-item" :class="{ active: active === 'profile' }" disabled title="Yakında">
        Profile
      </button>
    </nav>

    <div class="header-actions">
      <div v-if="showSearch" class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
          :value="searchTerm"
          class="header-search-input"
          type="text"
          placeholder="Kitap, yazar veya ISBN ara..."
          @input="$emit('update:searchTerm', $event.target.value)"
        />
      </div>
      <button class="btn-signout" @click="$emit('logout')">
        <span class="signout-icon">🚪</span> Sign Out
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  // Hangi nav item'ın aktif göründüğünü belirler: 'catalog' | 'myBooks' | 'profile'
  active: {
    type: String,
    default: 'catalog',
  },
  // Arama kutusunun görünüp görünmeyeceği (örn. Profile sayfasında gizlenebilir)
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
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-primary);
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
  font-size: 14px;
  opacity: 0.6;
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

.btn-signout {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-outline-variant);
  color: var(--color-primary);
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.btn-signout:hover {
  background-color: rgba(74, 124, 89, 0.1);
}
</style>