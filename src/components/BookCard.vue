<template>
  <article class="book-card" @click="$emit('view-detail', book.id)">
    <!-- Kapak görseli yerine kategoriye göre renklenen placeholder -->
    <div class="cover-placeholder" :style="coverStyle">
      <span class="status-badge" :class="isAvailable ? 'status-available' : 'status-loaned'">
        <span class="material-symbols-outlined">{{ isAvailable ? 'check_circle' : 'schedule' }}</span>
        {{ isAvailable ? 'Uygun' : 'Ödünç Alınmış' }}
      </span>
      <span class="material-symbols-outlined cover-icon">auto_stories</span>
    </div>

    <div class="card-body">
      <p class="category-label">{{ book.categoryName }}</p>
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>

      <div class="card-footer">
        <span class="copies-info">
          <span class="material-symbols-outlined">menu_book</span>
          {{ book.availableCopies }}/{{ book.totalCopies }} kopya
        </span>
        <button class="detail-btn" @click.stop="$emit('view-detail', book.id)">
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})

defineEmits(['view-detail'])

const isAvailable = computed(() => props.book.availableCopies > 0)

// Kategori adına göre sabit bir renk paleti seçiyoruz (tutarlı ama "canlı" hissi için)
const palettes = [
  ['#c8e8d0', '#4a7c59'], // primary tonları
  ['#f8e0a8', '#705c30'], // tertiary tonları
  ['#e4e0d8', '#4a4e4a'], // nötr tonlar
]

const coverStyle = computed(() => {
  const index = (props.book.categoryName?.length || 0) % palettes.length
  const [bg, fg] = palettes[index]
  return {
    background: `linear-gradient(135deg, ${bg} 0%, #faf6f0 100%)`,
    color: fg,
  }
})
</script>

<style scoped>
.book-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.cover-placeholder {
  height: 220px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-icon {
  font-size: 48px;
  opacity: 0.5;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.status-badge .material-symbols-outlined {
  font-size: 14px;
}

.status-available {
  color: var(--color-primary);
}

.status-loaned {
  color: var(--color-text-muted);
}

.card-body {
  padding: var(--space-card-padding);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.category-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-tertiary);
  margin: 0;
}

.book-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  margin: 4px 0 0;
  color: var(--color-text);
}

.book-author {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 12px;
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copies-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.copies-info .material-symbols-outlined {
  font-size: 15px;
}

.detail-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-pill);
  border: none;
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-btn .material-symbols-outlined {
  font-size: 18px;
}

.detail-btn:hover {
  background-color: var(--color-primary);
  color: white;
}
</style>