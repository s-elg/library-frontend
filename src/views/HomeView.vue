<template>
  <MainLayout
    active="catalog"
    v-model:searchTerm="searchTerm"
    @logout="handleLogout"
  >
    <div class="catalog-layout">
      <!-- Sol sidebar: kategori filtresi + durum filtreleri (sadece bu ekranda kullanıldığı için ayrı component yapılmadı) -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="material-symbols-outlined sidebar-icon">category</span>
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
                <span class="category-count">{{ pageResult?.totalCount ?? '-' }}</span>
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
            <span class="material-symbols-outlined sidebar-icon">tune</span>
            <h2 class="sidebar-title">Durum</h2>
          </div>
          <label class="checkbox-row custom-filter">
            <input type="checkbox" v-model="onlyAvailable" />
            <span class="custom-control-label">
              <span class="filter-icon" :class="onlyAvailable ? 'green-check' : 'open-circle'">
                <span v-if="onlyAvailable" class="material-symbols-outlined">check</span>
              </span>
              Sadece Uygun Olanlar
            </span>
          </label>
          <label class="checkbox-row custom-filter">
            <input type="checkbox" v-model="newReleases" />
            <span class="custom-control-label">
              <span class="filter-icon" :class="newReleases ? 'green-check' : 'open-circle'">
                <span v-if="newReleases" class="material-symbols-outlined">check</span>
              </span>
              Yeni Gelenler
            </span>
          </label>
        </div>
      </aside>

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

        <Pagination
          v-if="pageResult"
          v-model:currentPage="pageNumber"
          :totalPages="pageResult.totalPages"
        />
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { bookService } from '../services/bookService'
import { categoryService } from '../services/categoryService'
import BookCard from '../components/BookCard.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Pagination from '../components/common/Pagination.vue'

const router = useRouter()
const authStore = useAuthStore()

const categories = ref([])
const selectedCategoryId = ref(null)
const searchTerm = ref('')
const onlyAvailable = ref(false)
const newReleases = ref(false)
const pageNumber = ref(1)
const pageSize = 6
const pageResult = ref(null)
const loading = ref(false)
const selectedSortOption = ref('newest')

let searchDebounceTimer = null

async function loadCategories() {
  // NOT: bookCount backend'de henüz yok, geçici olarak rastgele üretiliyor.
  // Gerçek sayı istenirse CategoryDto'ya bookCount eklenip backend'de hesaplanmalı.
  const fetchedCategories = await categoryService.getAll()
  categories.value = fetchedCategories.map((cat) => ({
    ...cat,
    bookCount: Math.floor(Math.random() * 300) + 100,
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

onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script>

<style scoped>
/* .catalog-page kaldırıldı — padding/max-width artık MainLayout'un .app-content'inde yönetiliyor */

.catalog-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* Sidebar */
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
  padding: var(--space-card-padding);
  box-shadow: var(--shadow-soft);
  border: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sidebar-icon {
  font-size: 20px;
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
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  font-family: var(--font-body);
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
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
}

.category-item.active .category-count {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
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
  flex-shrink: 0;
}

.filter-icon .material-symbols-outlined {
  font-size: 12px;
  color: white;
}

.green-check {
  background-color: var(--color-primary);
}

.open-circle {
  border: 1px solid var(--color-outline-variant);
}

/* Main content */
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
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-surface);
}

.sort-dropdown {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-body);
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
</style>