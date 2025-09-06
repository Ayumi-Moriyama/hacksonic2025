<template>
  <v-container>
    <h2 class="text-center mb-6">診断結果ダッシュボード</h2>
    <div v-if="results.length === 0" class="text-center my-8">
      <p>診断履歴がありません。</p>
    </div>
    <template v-else>
      <v-row class="flex-wrap" align="stretch">
        <!-- 性格診断の結果カード -->
        <v-col cols="12" md="6" class="mb-4">
          <v-card class="hoverable" @click="showPersonality = true">
            <v-card-title>
              <span>性格診断の結果</span>
            </v-card-title>
            <!-- <v-card-text>
              <div v-if="personalityResult">
                <p style="white-space: pre-line;">{{ personalityResult }}</p>
              </div>
              <div v-if="latestResult.gender">
                <strong>性別:</strong> {{ latestResult.gender }}
              </div>
            </v-card-text> -->
            <v-card-actions>
              <v-btn color="primary" @click.stop="showPersonality = true">詳細を見る</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <!-- 理想の人物像の結果カード -->
        <v-col cols="12" md="6" class="mb-4">
          <v-card class="hoverable" @click="showIdeal = true">
            <v-card-title>
              <span>理想の人物像の結果</span>
            </v-card-title>
            <!-- <v-card-text>
              <div v-if="latestResult.idealSummary">
                <strong>理想の人物像:</strong>
                <p>{{ latestResult.idealSummary }}</p>
              </div>
              <div v-if="latestResult.imageUrl">
                <v-img :src="latestResult.imageUrl" max-width="300" class="mx-auto mb-2" />
              </div>
              <div v-if="latestResult.compare">
                <strong>アドバイス:</strong>
                <p class="mb-0" style="white-space: pre-line; max-height: 3.5em; overflow: hidden; text-overflow: ellipsis;">{{ latestResult.compare }}</p>
              </div>
            </v-card-text> -->
            <v-card-actions>
              <v-btn color="primary" @click.stop="showIdeal = true">詳細を見る</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <!-- 性格診断の詳細ダイアログ -->
      <v-dialog v-model="showPersonality" max-width="500">
        <v-card>
          <v-card-title>性格診断の詳細</v-card-title>
          <v-card-text>
            <div v-if="personalityResult">
              <p style="white-space: pre-line;">{{ personalityResult }}</p>
            </div>
            <div v-if="latestResult.gender">
              <strong>性別:</strong> {{ latestResult.gender }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="showPersonality = false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 理想の人物像の詳細ダイアログ -->
      <v-dialog v-model="showIdeal" max-width="600">
        <v-card>
          <v-card-title>理想の人物像の詳細</v-card-title>
          <v-card-text>
            <div v-if="latestResult.idealSummary">
              <strong>理想の人物像:</strong>
              <p>{{ latestResult.idealSummary }}</p>
            </div>
            <div v-if="latestResult.imageUrl">
              <v-img :src="latestResult.imageUrl" max-width="400" class="mx-auto mb-4" />
            </div>
            <div v-if="latestResult.compare">
              <strong>アドバイス:</strong>
              <p style="white-space: pre-line;">{{ latestResult.compare }}</p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="showIdeal = false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const results = ref([])
const showPersonality = ref(false)
const showIdeal = ref(false)
const personalityResult = ref('')
const latestResult = ref({})

onMounted(() => {
  // localStorageから診断履歴を取得
  const raw = localStorage.getItem('ideal_results')
  if (raw) {
    try {
      results.value = JSON.parse(raw)
      if (results.value.length > 0) {
        latestResult.value = results.value[results.value.length - 1]
      }
    } catch {
      results.value = []
      latestResult.value = {}
    }
  }
  // 性格診断のテキスト取得
  const crt = localStorage.getItem('currentResultText')
  if (crt) {
    personalityResult.value = crt
  } else {
    // データがなければ空
    personalityResult.value = ''
  }
})
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
</style>
