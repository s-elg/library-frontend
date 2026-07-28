<template>
  <div class="app-shell">
    <TopNavBar
      :active="active"
      :show-search="showSearch"
      :search-term="searchTerm"
      @update:searchTerm="$emit('update:searchTerm', $event)"
      @logout="$emit('logout')"
    />
    <div class="app-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import TopNavBar from './TopNavBar.vue'

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
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}
</style>