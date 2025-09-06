<template>
  <v-container>
    <h2 class="text-center mb-6">診断結果ダッシュボード</h2>
    <div v-if="results.length === 0" class="text-center my-8">
      <p>診断履歴がありません。</p>
    </div>
    <v-row v-else>
      <v-col
        v-for="(item, idx) in results"
        :key="idx"
        cols="12"
        md="6"
        lg="4"
        class="mb-4"
      >
        <v-card>
          <v-card-title>
            <span>診断 #{{ results.length - idx }}</span>
          </v-card-title>
          <v-card-text>
            <div v-if="item.idealSummary">
              <strong>理想の人物像:</strong>
              <p>{{ item.idealSummary }}</p>
            </div>
            <div v-if="item.imageUrl">
              <v-img :src="item.imageUrl" max-width="300" class="mx-auto mb-2" />
            </div>
            <div v-if="item.compare">
              <strong>アドバイス:</strong>
              <p style="white-space: pre-line;">{{ item.compare }}</p>
            </div>
            <div v-if="item.gender">
              <strong>性別:</strong> {{ item.gender }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const results = ref([])

onMounted(() => {
  // localStorageから診断履歴を取得
  const raw = localStorage.getItem('ideal_results')
  if (raw) {
    try {
      results.value = JSON.parse(raw)
    } catch {
      results.value = []
    }
  }
})
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
</style>
