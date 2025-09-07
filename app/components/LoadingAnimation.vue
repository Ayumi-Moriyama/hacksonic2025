<template>
  <div class="loading-animation">
    <div class="cloud-bg"></div>
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

/* 雲の背景 */
.cloud-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 340px;
  height: 180px;
  background: rgba(255,255,255,0.75);
  border-radius: 110px;
  box-shadow:
    80px 0px 80px 0px rgba(255,255,255,0.55),
    160px 30px 100px 0px rgba(255,255,255,0.45),
    60px 90px 90px 0px rgba(255,255,255,0.38),
    -50px 40px 70px 0px rgba(255,255,255,0.50),
    0px 0px 120px 20px rgba(255,255,255,0.32);
  z-index: 0;
  pointer-events: none;
}

.v-progress-circular,
.progress-text,
.loading-text {
  z-index: 1;
  position: relative;
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
