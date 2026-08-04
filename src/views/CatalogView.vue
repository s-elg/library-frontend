<template>
  <MainLayout
    active="catalog"
    :show-search="true"
    :search-term="searchTerm"
    @update:searchTerm="onSearchTermChange"
    @logout="handleLogout"
  >
    <div class="catalog-layout">
      <!-- Arka Plan Karartması (Mobilde sidebar açıkken) -->
      <div 
        class="sidebar-overlay" 
        v-if="isSidebarOpen" 
        @click="closeSidebar"
      ></div>

      <!-- Sol filtre paneli (Mobilde Sidebar) -->
      <aside class="filters-panel" :class="{ 'is-open': isSidebarOpen }">
        
        <!-- Sadece mobilde görünen sidebar başlığı ve kapatma butonu -->
        <div class="sidebar-header">
          <h3>Filtreler</h3>
          <button class="close-btn" @click="closeSidebar" aria-label="Kapat">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="filter-card">
          <h2 class="filter-title">
            <span class="material-symbols-outlined">category</span>
            Kategoriler
          </h2>
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
            <li v-for="cat in categories" :key="cat.id">
              <button
                class="category-item"
                :class="{ active: selectedCategoryId === cat.id }"
                @click="selectCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            </li>
          </ul>
        </div>

        <div class="filter-card">
          <h2 class="filter-title">
            <span class="material-symbols-outlined">tune</span>
            Durum
          </h2>
          <label class="checkbox-row">
            <input type="checkbox" v-model="availableOnly" />
            <span>Sadece uygun olanlar</span>
          </label>
        </div>
      </aside>

      <!-- Sağ içerik alanı -->
      <section class="catalog-content">
        <header class="content-header">
          <div>
            <h1 class="content-title">Kütüphane Kataloğu</h1>
            <p class="content-subtitle">
              {{ totalCount }} kitap arasında keşfe çıkın.
            </p>
          </div>
          
          <!-- Sadece mobilde görünen filtre açma butonu -->
          <button class="filter-toggle-btn" @click="toggleSidebar">
            <span class="material-symbols-outlined">filter_list</span>
            Filtrele
          </button>
        </header>

        <!-- Yükleniyor durumu -->
        <div v-if="loading" class="state-message">Yükleniyor...</div>

        <!-- Hata durumu -->
        <div v-else-if="error" class="state-message error">
          Kitaplar yüklenirken bir sorun oluştu.
        </div>

        <!-- Sonuç yok -->
        <div v-else-if="filteredBooks.length === 0" class="state-message">
          Aramanızla eşleşen kitap bulunamadı.
        </div>

        <!-- Kitap grid'i -->
        <div v-else class="book-grid">
          <BookCard
            v-for="book in filteredBooks"
            :key="book.id"
            :book="book"
            @view-detail="goToDetail"
          />
        </div>

        <Pagination
          v-if="!loading && !error"
          v-model:currentPage="currentPage"
          :total-pages="totalPages"
        />
      </section>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import BookCard from '../components/BookCard.vue'
import Pagination from '../components/common/Pagination.vue'
import { bookService } from '../services/bookService'
import { categoryService } from '../services/categoryService'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// --- State ---
const books = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref(false)

const searchTerm = ref('')
const selectedCategoryId = ref(null)
const availableOnly = ref(false)

const currentPage = ref(1)
const pageSize = 9
const totalPages = ref(1)
const totalCount = ref(0)

// --- Mobil Sidebar State ---
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

// Arama input'unda her tuşta backend'e istek atmamak için debounce
let searchDebounceTimer = null
function onSearchTermChange(value) {
  searchTerm.value = value
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1 
    fetchBooks()
  }, 400)
}

function selectCategory(categoryId) {
  selectedCategoryId.value = categoryId
  currentPage.value = 1
  fetchBooks()
  closeSidebar()
}

const filteredBooks = computed(() => {
  if (!availableOnly.value) return books.value
  return books.value.filter((b) => b.availableCopies > 0)
})

// --- Veri çekme ---
async function fetchBooks() {
  loading.value = true
  error.value = false
  try {
    let data
    if (searchTerm.value.trim()) {
      data = await bookService.search(searchTerm.value.trim(), currentPage.value, pageSize)
    } else if (selectedCategoryId.value) {
      data = await bookService.getByCategory(selectedCategoryId.value, currentPage.value, pageSize)
    } else {
      data = await bookService.getAll(currentPage.value, pageSize)
    }
    books.value = data.items
    totalPages.value = data.totalPages
    totalCount.value = data.totalCount
  } catch (err) {
    console.error('Kitaplar yüklenemedi:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    categories.value = await categoryService.getAll()
  } catch (err) {
    console.error('Kategoriler yüklenemedi:', err)
  }
}

watch(currentPage, () => {
  fetchBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

function goToDetail(bookId) {
  router.push(`/book/${bookId}`)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchCategories()
  fetchBooks()
})
</script>

<style scoped>
.catalog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: start;
  position: relative;
}

/* --- Masaüstünde Gizli Kalması Gereken Mobil Elemanlar --- */
.sidebar-header {
  display: none;
}
.filter-toggle-btn {
  display: none;
}

/* Filtre paneli (Masaüstü) */
.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-soft);
}

.filter-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 14px;
  transition: background-color 0.15s, color 0.15s;
}

.category-item:hover {
  background-color: var(--color-primary-soft);
}

.category-item.active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 700;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
}

/* İçerik alanı */
.content-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.content-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 4px;
}

.content-subtitle {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.state-message {
  text-align: center;
  padding: 64px 0;
  color: var(--color-text-muted);
  font-size: 16px;
}

.state-message.error {
  color: var(--color-error, #b83230);
}

/* --- Responsive Kurallar --- */
@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  /* Overlay (Arka plan karartması) */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  /* Mobilde Filtre Paneli (Sidebar) */
  .filters-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background-color: var(--color-surface, #ffffff);
    z-index: 50;
    padding: 24px;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    overflow-y: auto;
  }

  .filters-panel.is-open {
    transform: translateX(0);
  }

  /* Sadece mobilde görünen elemanlara flex veriyoruz */
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .sidebar-header h3 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 20px;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .filter-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--shadow-soft);
  }

  /* Mobilde kart görünümlerini sıfırla, düz liste gibi görünsün */
  .filter-card {
    box-shadow: none;
    padding: 0 0 24px 0;
    border-radius: 0;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>