<template>
  <div class="loading-animation">
    <v-progress-circular
      :size="80"
      :width="6"
      v-bind="progress !== null ? { value: progress } : {}"
      :indeterminate="progress === null"
      color="primary"
    >
      <span v-if="progress !== null" class="progress-text">{{ progress }}%</span>
    </v-progress-circular>
    <div class="loading-text">{{ loadingText }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: null
  },
  loadingText: {
    type: String,
    default: '読み込み中...'
  }
})
</script>

<style scoped>
.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}
.progress-text {
  font-size: 1.4rem;
  font-weight: bold;
  color: #1976d2;
}
.loading-text {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: #1976d2;
  letter-spacing: 0.1em;
}
</style>
