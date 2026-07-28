<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn page-arrow"
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      <span class="material-symbols-outlined">chevron_left</span>
    </button>
    <button
      v-for="p in totalPages"
      :key="p"
      class="page-btn"
      :class="{ active: p === currentPage }"
      @click="$emit('update:currentPage', p)"
    >
      {{ p }}
    </button>
    <button
      class="page-btn page-arrow"
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      <span class="material-symbols-outlined">chevron_right</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

defineEmits(['update:currentPage'])
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 32px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-outline-variant);
  background-color: var(--color-surface);
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 14px;
  font-family: var(--font-body);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}

.page-btn:not(.active):not(:disabled):hover {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}

.page-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.page-arrow .material-symbols-outlined {
  font-size: 18px;
}
</style>