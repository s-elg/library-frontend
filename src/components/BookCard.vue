<template>
  <article class="book-card" @click="$emit('view-detail', book.id)">
    <!-- Kapak görseli yerine kategoriye göre renklenen placeholder -->
    <div class="cover-placeholder" :style="coverStyle">
      <span class="status-badge" :class="isAvailable ? 'status-available' : 'status-loaned'">
        {{ isAvailable ? '✓ Uygun' : '⏱ Ödünç Alınmış' }}
      </span>
      <span class="cover-icon">📖</span>
    </div>

    <div class="card-body">
      <p class="category-label">{{ book.categoryName }}</p>
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>

      <div class="card-footer">
        <span class="copies-info">{{ book.availableCopies }}/{{ book.totalCopies }} kopya</span>
        <button class="detail-btn" @click.stop="$emit('view-detail', book.id)">→</button>
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
  background-color: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(46, 50, 48, 0.06);
  border: 1px solid rgba(196, 200, 188, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74, 124, 89, 0.1);
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
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.status-available {
  color: var(--color-primary, #4a7c59);
}

.status-loaned {
  color: var(--color-text-muted, #6b6358);
}

.card-body {
  padding: 20px;
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
  color: var(--color-tertiary, #705c30);
  margin: 0;
}

.book-title {
  font-family: var(--font-headline, 'Literata', serif);
  font-size: 18px;
  font-weight: 700;
  margin: 4px 0 0;
  color: var(--color-text, #2e3230);
}

.book-author {
  font-size: 14px;
  color: var(--color-text-muted, #6b6358);
  margin: 0 0 12px;
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(196, 200, 188, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copies-info {
  font-size: 13px;
  color: var(--color-text-muted, #6b6358);
}

.detail-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background-color: rgba(74, 124, 89, 0.1);
  color: var(--color-primary, #4a7c59);
  cursor: pointer;
  font-weight: bold;
}

.detail-btn:hover {
  background-color: var(--color-primary, #4a7c59);
  color: white;
}
</style>