<template>
  <v-container class="sunrise-bg">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">理想の自分 診断結果</h2>
        <div v-if="!loaded" class="text-center my-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
          <v-card class="mb-6 pa-4">
            <h3 class="mb-4">理想の人物像</h3>
            <div v-if="result.idealSummary">
              <p class="mb-4">{{ result.idealSummary }}</p>
            </div>
            <div v-if="result.imageUrl">
              <v-img :src="result.imageUrl" max-width="400" class="mx-auto mb-4" />
            </div>
            <div v-else class="mb-4 red--text">
              イメージ画像の生成に失敗しました。
            </div>
          </v-card>
          <v-card class="mb-6 pa-4">
            <h3 class="mb-4">現在の自分との比較・アドバイス</h3>
            <div v-if="result.compare">
              <p style="white-space: pre-line;">{{ result.compare }}</p>
            </div>
          </v-card>
          <div class="text-center mt-8">
            <v-btn color="primary" @click="goHome">最初の画面に戻る</v-btn>
            <v-btn color="secondary" class="ml-4" @click="goDashboard">ダッシュボードへ</v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const loaded = ref(false)
const result = ref({})
const themeOrder = ref([])
const themeHistories = ref({})
const currentResultText = ref('')

const router = useRouter()

onMounted(() => {
  try {
    const r = sessionStorage.getItem('ideal_result')
    const o = sessionStorage.getItem('ideal_themeOrder')
    const h = sessionStorage.getItem('ideal_themeHistories')
    const crt = localStorage.getItem('currentResultText')
    if (r && o && h) {
      result.value = JSON.parse(r)
      themeOrder.value = JSON.parse(o)
      themeHistories.value = JSON.parse(h)
      currentResultText.value = crt || ''
      loaded.value = true

      // 診断履歴をlocalStorageに追記
      const newResult = result.value
      if (newResult && newResult.idealSummary && newResult.compare) {
        let history = []
        try {
          history = JSON.parse(localStorage.getItem('ideal_results') || '[]')
        } catch {
          history = []
        }
        // 直近と同じ内容は重複保存しない
        if (
          history.length === 0 ||
          JSON.stringify(history[history.length - 1]) !== JSON.stringify(newResult)
        ) {
          history.push(newResult)
          localStorage.setItem('ideal_results', JSON.stringify(history))
        }
      }
    } else {
      alert('診断データが見つかりません。')
      router.push('/')
    }
  } catch (e) {
    alert('診断データの読み込みに失敗しました。')
    router.push('/')
  }
})

function goHome() {
  router.push('/')
}

function goDashboard() {
  router.push('/dashboard')
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
.sunrise-bg {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 40%, #ffe5b4 0%, #ffb347 40%, #fff5e1 100%);
}
</style>
