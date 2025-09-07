<template>
  <div class="mirror-bg">
    <div class="mirror-glint"></div>
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
      <!-- アファメーション表示カード -->
      <v-row>
        <v-col cols="12" md="6" class="mb-4">
          <v-card>
            <v-card-title>
              <span>おすすめアファメーション</span>
            </v-card-title>
            <v-card-text>
              <div v-if="affirmationLoading" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <div>生成中...</div>
              </div>
              <div v-else-if="affirmationError">
                <v-alert type="error" dense>{{ affirmationError }}</v-alert>
              </div>
              <div v-else-if="affirmations.length > 0">
                <ol>
                  <li v-for="(a, i) in affirmations" :key="i">{{ a }}</li>
                </ol>
              </div>
              <div v-else class="text-grey">まだアファメーションは生成されていません。</div>
            </v-card-text>
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
    
    <!-- アファメーション表示ダイアログ（廃止） -->
    <!--
    <v-dialog v-model="showAffirmation" max-width="500">
      <v-card>
        <v-card-title>おすすめアファメーション</v-card-title>
        <v-card-text>
          <div v-if="affirmationLoading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
            <div>生成中...</div>
          </div>
          <div v-else-if="affirmationError">
            <v-alert type="error" dense>{{ affirmationError }}</v-alert>
          </div>
          <div v-else-if="affirmations.length > 0">
            <ol>
              <li v-for="(a, i) in affirmations" :key="i">{{ a }}</li>
            </ol>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showAffirmation = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    -->
    <!-- アファメーション生成・診断リセットボタン -->
    <div class="text-center my-8">
      <v-btn color="success" class="mr-4" @click="onGenerateAffirmation">アファメーションを作る</v-btn>
      <v-btn color="error" @click="onResetDiagnosis">最初から診断をやり直す</v-btn>
    </div>
  </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const results = ref([])
const showPersonality = ref(false)
const showIdeal = ref(false)
const personalityResult = ref('')
const latestResult = ref({})

const showAffirmation = ref(false) // UIからは未使用（ダイアログ廃止のため）
const affirmations = ref([])
const affirmationLoading = ref(false)
const affirmationError = ref("")

async function onGenerateAffirmation() {
  affirmationError.value = ""
  affirmations.value = []
  if (!latestResult.value.idealSummary) {
    affirmationError.value = "理想の人物像が見つかりません。"
    return
  }
  affirmationLoading.value = true
  try {
    const res = await fetch("/api/affirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idealSummary: latestResult.value.idealSummary })
    })
    const data = await res.json()
    if (data.affirmations && Array.isArray(data.affirmations)) {
      affirmations.value = data.affirmations
    } else {
      affirmationError.value = "アファメーションの生成に失敗しました。"
    }
  } catch (e) {
    affirmationError.value = "通信エラーが発生しました。"
  } finally {
    affirmationLoading.value = false
  }
}
import { useRouter } from '#app'
const router = useRouter()
function onResetDiagnosis() {
  localStorage.removeItem('ideal_results')
  localStorage.removeItem('currentResultText')
  localStorage.removeItem('gender')
  // 必要に応じて他の診断関連データも削除
  router.push('/')
}

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
.mirror-bg {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(120deg, #e0e0e0 0%, #f5f5f5 60%, #e0e0e0 100%);
  overflow: hidden;
}
.mirror-glint {
  position: absolute;
  top: 10%;
  left: -20%;
  width: 140%;
  height: 8px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  filter: blur(2px);
  border-radius: 10px;
  transform: rotate(-15deg) translateY(0%);
  animation: glint-move 3.2s linear infinite;
}

@keyframes glint-move {
  0% {
    opacity: 0;
    transform: translateX(-30%) translateY(0%) rotate(-15deg) scaleY(1);
  }
  10% {
    opacity: 1;
    transform: translateX(-10%) translateY(20%) rotate(-15deg) scaleY(1.5);
  }
  50% {
    opacity: 1;
    transform: translateX(60%) translateY(60%) rotate(-15deg) scaleY(1.8);
  }
  80% {
    opacity: 0.7;
    transform: translateX(110%) translateY(90%) rotate(-15deg) scaleY(1.2);
  }
  100% {
    opacity: 0;
    transform: translateX(110%) translateY(100%) rotate(-15deg) scaleY(1);
  }
}
.mb-6 {
  margin-bottom: 2rem;
}
</style>
