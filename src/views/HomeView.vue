<template>
  <div class="catalog-page">
    <!-- Üst Menü (Header) -->
    <header class="top-nav">
      <div class="logo-container">
        <!-- İkon yerine geçici bir emoji/sembol, projende SVG kullanabilirsin -->
        <span class="logo-icon">🌿</span>
        <span class="logo-text">Terra Library</span>
      </div>

      <nav class="nav-links">
        <button class="nav-item active">Catalog</button>
        <button class="nav-item">My Books</button>
        <button class="nav-item">Profile</button>
      </nav>

      <div class="header-actions">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchTerm"
            class="header-search-input"
            type="text"
            placeholder="Kitap, yazar veya ISBN ara..."
          />
        </div>
        <button class="btn-signout" @click="handleLogout">
          <span class="signout-icon">🚪</span> Sign Out
        </button>
      </div>
    </header>

    <div class="catalog-layout">
      <!-- Sol sidebar: kategori filtresi -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="sidebar-icon">🔖</span>
            <h2 class="sidebar-title">Kategoriler</h2>
          </div>
          <ul class="category-list">
            <li>
              <button
                class="category-item"
                :class="{ active: selectedCategoryId === null }"
                @click="selectCategory(null)"
              >
                Tümü
                <span class="category-count">1240</span>
              </button>
            </li>
            <li v-for="category in categories" :key="category.id">
              <button
                class="category-item"
                :class="{ active: selectedCategoryId === category.id }"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
                <span class="category-count">{{ category.bookCount || 0 }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="sidebar-icon">⚏</span>
            <h2 class="sidebar-title">Durum</h2>
          </div>
          <label class="checkbox-row custom-filter">
            <input type="checkbox" v-model="onlyAvailable" />
            <span class="custom-control-label">
              <span class="filter-icon" :class="onlyAvailable ? 'green-check' : 'open-circle'">
                {{ onlyAvailable ? '✔' : '' }}
              </span>
              Sadece Uygun Olanlar
            </span>
          </label>
          <label class="checkbox-row custom-filter">
            <input type="checkbox" v-model="newReleases" />
            <span class="custom-control-label">
              <span class="filter-icon" :class="newReleases ? 'green-check' : 'open-circle'">
                {{ newReleases ? '✔' : '' }}
              </span>
              Yeni Gelenler
            </span>
          </label>
        </div>
      </aside>

      <!-- Sağ ana alan: kitap grid -->
      <main class="catalog-main">
        <div class="page-title-section">
          <div class="title-group">
            <h1>Kütüphane Kataloğu</h1>
            <p>Tüm kitaplar arasında keşfe çıkın. Doğanın renkleri ve sakinliği içinde.</p>
          </div>
          <div class="sort-section">
            <label class="sort-label">Sırala:</label>
            <div class="sort-dropdown-container">
              <select v-model="selectedSortOption" class="sort-dropdown">
                <option value="newest">En Yeniler</option>
              </select>
            </div>
          </div>
        </div>

        <p v-if="loading" class="loading-text">Kitaplar yükleniyor...</p>
        <p v-else-if="displayedBooks.length === 0" class="loading-text">
          Sonuç bulunamadı.
        </p>

        <div v-else class="book-grid">
          <BookCard
            v-for="book in displayedBooks"
            :key="book.id"
            :book="book"
            @view-detail="goToDetail"
          />
        </div>

        <!-- Sayfalama -->
        <div v-if="pageResult && pageResult.totalPages > 1" class="pagination">
          <button
            class="page-btn page-arrow"
            :disabled="pageNumber === 1"
            @click="pageNumber--"
          >
            ‹
          </button>
          <button
            v-for="p in pageResult.totalPages"
            :key="p"
            class="page-btn"
            :class="{ active: p === pageNumber }"
            @click="pageNumber = p"
          >
            {{ p }}
          </button>
          <button
            class="page-btn page-arrow"
            :disabled="pageNumber === pageResult.totalPages"
            @click="pageNumber++"
          >
            ›
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { bookService } from '../services/bookService'
import { categoryService } from '../services/categoryService'
import BookCard from '../components/BookCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const categories = ref([])
const selectedCategoryId = ref(null)
const searchTerm = ref('') // Arama geri geldi (Header'da)
const onlyAvailable = ref(false)
const newReleases = ref(false) 
const pageNumber = ref(1)
const pageSize = 6
const pageResult = ref(null)
const loading = ref(false)
const selectedSortOption = ref('newest')

let searchDebounceTimer = null

async function loadCategories() {
  const fetchedCategories = await categoryService.getAll()
  categories.value = fetchedCategories.map(cat => ({
    ...cat,
    bookCount: Math.floor(Math.random() * 300) + 100 
  }))
}

async function loadBooks() {
  loading.value = true
  try {
    let result

    if (searchTerm.value.trim().length > 0) {
      result = await bookService.search(searchTerm.value.trim(), pageNumber.value, pageSize)
    } else if (selectedCategoryId.value) {
      result = await bookService.getByCategory(selectedCategoryId.value, pageNumber.value, pageSize)
    } else {
      result = await bookService.getAll(pageNumber.value, pageSize)
    }

    pageResult.value = result
  } finally {
    loading.value = false
  }
}

const displayedBooks = computed(() => {
  let items = pageResult.value?.items || []
  if (onlyAvailable.value) {
    items = items.filter((b) => b.availableCopies > 0)
  }
  return items
})

function selectCategory(categoryId) {
  selectedCategoryId.value = categoryId
  searchTerm.value = '' 
  pageNumber.value = 1
}

function goToDetail(bookId) {
  router.push({ name: 'BookDetail', params: { id: bookId } })
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

// Arama kutusuna yazıldığında debounced API çağrısı
watch(searchTerm, () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    pageNumber.value = 1
    loadBooks()
  }, 400)
})

watch([selectedCategoryId, pageNumber, newReleases, selectedSortOption], () => {
  loadBooks()
})

onMounted(() => {
  loadCategories()
  loadBooks()
})
</script>

<style scoped>
.catalog-page {
  padding: var(--space-card-padding);
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Tasarımı */
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
}

.nav-item:hover {
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
  background-color: rgba(74, 124, 89, 0.1); /* --color-primary şeffaf hali */
}

/* İçerik Düzeni */
.catalog-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--color-outline-variant);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sidebar-icon {
  font-size: 1.2rem;
  color: var(--color-tertiary);
}

.sidebar-title {
  font-family: var(--font-heading);
  font-size: 16px;
  margin: 0;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
}

.category-item:hover {
  background-color: var(--color-outline-variant);
}

.category-item.active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

.category-count {
  font-size: 12px;
  padding: 2px 6px;
  background-color: var(--color-outline-variant);
  border-radius: 999px;
  color: var(--color-text-muted);
}

.category-item.active .category-count {
  background-color: white;
  color: var(--color-primary);
}

.checkbox-row.custom-filter {
  margin-bottom: 8px;
}

.checkbox-row.custom-filter input {
  display: none;
}

.custom-control-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text);
  cursor: pointer;
}

.filter-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
}

.green-check {
  background-color: var(--color-primary);
  color: white;
}

.open-circle {
  border: 1px solid var(--color-outline-variant);
  color: transparent;
}

.catalog-main {
  flex: 1;
  min-width: 0;
}

.page-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-group h1 {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.title-group p {
  color: var(--color-text-muted);
  margin: 0;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.sort-dropdown-container {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-outline-variant);
}

.sort-dropdown {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.loading-text {
  color: var(--color-text-muted);
  padding: 40px 0;
  text-align: center;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-outline-variant);
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.page-arrow {
  font-size: 1.2rem;
  color: var(--color-text);
}
</style>