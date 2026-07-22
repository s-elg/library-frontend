<template>
  <div class="catalog-page">
    <!-- Üst bar: kullanıcı bilgisi + çıkış -->
    <header class="page-header">
      <h1>Hoş Geldin{{ authStore.fullName ? ', ' + authStore.fullName : '' }}</h1>
      <button class="btn-secondary" @click="handleLogout">Çıkış Yap</button>
    </header>

    <div class="catalog-layout">
      <!-- Sol sidebar: kategori filtresi -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <h2 class="sidebar-title">Kategoriler</h2>
          <ul class="category-list">
            <li>
              <button
                class="category-item"
                :class="{ active: selectedCategoryId === null }"
                @click="selectCategory(null)"
              >
                Tümü
              </button>
            </li>
            <li v-for="category in categories" :key="category.id">
              <button
                class="category-item"
                :class="{ active: selectedCategoryId === category.id }"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </li>
          </ul>
        </div>

        <div class="sidebar-card">
          <h2 class="sidebar-title">Durum</h2>
          <label class="checkbox-row">
            <input type="checkbox" v-model="onlyAvailable" />
            Sadece Uygun Olanlar
          </label>
        </div>
      </aside>

      <!-- Sağ ana alan: arama + kitap grid -->
      <main class="catalog-main">
        <div class="search-row">
          <input
            v-model="searchTerm"
            class="search-input"
            type="text"
            placeholder="Kitap veya yazar ara..."
          />
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
            class="page-btn"
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
            class="page-btn"
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
const searchTerm = ref('')
const onlyAvailable = ref(false)
const pageNumber = ref(1)
const pageSize = 6
const pageResult = ref(null)
const loading = ref(false)

let searchDebounceTimer = null

async function loadCategories() {
  categories.value = await categoryService.getAll()
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

// "Sadece Uygun Olanlar" backend'de henüz desteklenmiyor,
// bu yüzden sadece mevcut sayfadaki sonuçları client-side filtreliyoruz.
// Not: Bu, toplam sayfa sayısını/sayımını etkilemez - ileride backend'e
// bir "onlyAvailable" query parametresi eklemek daha doğru bir çözüm olur.
const displayedBooks = computed(() => {
  const items = pageResult.value?.items || []
  if (!onlyAvailable.value) return items
  return items.filter((b) => b.availableCopies > 0)
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

// Arama kutusuna her yazıldığında API'yi anında değil, 400ms sonra çağır (debounce)
watch(searchTerm, () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    pageNumber.value = 1
    loadBooks()
  }, 400)
})

watch([selectedCategoryId, pageNumber], () => {
  loadBooks()
})

onMounted(() => {
  loadCategories()
  loadBooks()
})
</script>

<style scoped>
.catalog-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
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
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: rgba(74, 124, 89, 0.08);
}

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
  background-color: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  box-shadow: 0 4px 20px rgba(46, 50, 48, 0.04);
}

.sidebar-title {
  font-family: var(--font-headline, 'Literata', serif);
  font-size: 16px;
  margin: 0 0 12px;
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
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-md, 8px);
  border: none;
  background: transparent;
  color: var(--color-text-muted, #6b6358);
  cursor: pointer;
  font-size: 14px;
}

.category-item:hover {
  background-color: rgba(74, 124, 89, 0.06);
}

.category-item.active {
  background-color: var(--color-primary, #4a7c59);
  color: white;
  font-weight: 600;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-muted, #6b6358);
  cursor: pointer;
}

.catalog-main {
  flex: 1;
  min-width: 0;
}

.search-row {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(196, 200, 188, 0.5);
  background-color: var(--color-surface, #ffffff);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary, #4a7c59);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.loading-text {
  color: var(--color-text-muted, #6b6358);
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
  border-radius: 999px;
  border: 1px solid rgba(196, 200, 188, 0.5);
  background-color: var(--color-surface, #ffffff);
  cursor: pointer;
}

.page-btn.active {
  background-color: var(--color-primary, #4a7c59);
  color: white;
  border-color: var(--color-primary, #4a7c59);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>