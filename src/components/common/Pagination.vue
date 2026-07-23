<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn page-arrow"
      :disabled="currentPage === 1"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      ‹
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
      ›
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