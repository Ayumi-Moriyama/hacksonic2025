<template>
<v-container class="ideal-bg">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">理想の自分を診断</h2>
        <div v-if="loading">
          <LoadingAnimation
            :progress="progress"
            loadingText="診断結果を生成中..."
          />
        </div>
        <!-- テーマ選択 -->
        <div v-else-if="step === 'selectTheme'">
          <v-card class="mb-6">
            <v-card-title class="text-center">
              あなたが深掘りしたいテーマを選んでください（{{ themeOrder.length + 1 }}/3）
            </v-card-title>
            <v-card-text>
              <v-btn
                block
                color="primary"
                class="mb-2"
                v-for="theme in remainingThemes"
                :key="theme"
                @click="startTheme(theme)"
              >
                {{ theme }}
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
        <!-- チャット深掘り -->
        <div v-else-if="step === 'chat'">
          <div class="mb-4">
            <strong>テーマ: {{ currentTheme }}</strong>
            <span class="ml-4">({{ turnCount }}/3往復)</span>
          </div>
          <div class="chat-area mb-4">
            <div v-for="(msg, i) in themeHistories[currentTheme]" :key="i" :class="msg.role === 'user' ? 'chat-user' : 'chat-ai'">
              <v-card :color="msg.role === 'user' ? 'blue lighten-5' : msg.role === 'assistant' ? 'grey lighten-4' : 'green lighten-5'" class="pa-3 mb-2">
                <div>{{ msg.content }}</div>
              </v-card>
            </div>
          </div>
          <v-text-field
            v-model="userInput"
            label="メッセージを入力"
            :disabled="loading"
            @keyup.enter="sendUserMessage"
            append-inner-icon="mdi-send"
            @click:append-inner="sendUserMessage"
            class="bg-white"
            hide-details
          ></v-text-field>
          <!-- <v-btn color="primary" class="mt-2" :disabled="!userInput || loading" @click="sendUserMessage">
            送信
          </v-btn> -->
        </div>
        <!-- 次のテーマ選択 or 診断結果選択 -->
        <div v-else-if="step === 'nextOrResult'">
          <v-card class="mb-6">
            <v-card-title class="text-center">
              残りのテーマから次に深掘りしたいものを選んでください
            </v-card-title>
            <v-card-text>
              <v-btn
                block
                color="primary"
                class="mb-2"
                v-for="theme in remainingThemes"
                :key="theme"
                @click="startTheme(theme)"
              >
                {{ theme }}
              </v-btn>
              <v-divider class="my-4"></v-divider>
              <v-btn
                block
                color="secondary"
                class="mb-2"
                @click="goToDiagnosis"
              >
                この時点で診断結果を見る
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
        <!-- 全テーマ終了時の診断結果遷移 -->
        <div v-else-if="step === 'allDone'" class="text-center">
          <v-btn color="primary" class="mt-6" @click="goToDiagnosis">
            診断結果を見る
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingAnimation from '~/components/LoadingAnimation.vue'

const themes = [
  '仕事をしているとき',
  '人と過ごすとき',
  '自分だけで過ごすひととき'
]
const step = ref('selectTheme') // 'selectTheme' | 'chat' | 'nextOrResult' | 'allDone'
const themeOrder = ref([])
const themeHistories = reactive({})
const finishedThemes = ref([])
const currentTheme = ref('')
const turnCount = ref(0)
const userInput = ref('')
const loading = ref(false)
const progress = ref(null)

const router = useRouter()

onMounted(() => {
  // 初期化
  themes.forEach(t => { themeHistories[t] = [] })
})

const remainingThemes = computed(() =>
  themes.filter(t => !finishedThemes.value.includes(t) && !themeOrder.value.includes(t))
)

function startTheme(theme) {
  currentTheme.value = theme
  if (!themeOrder.value.includes(theme)) {
    themeOrder.value.push(theme)
  }
  turnCount.value = 0
  step.value = 'chat'
  // 最初のsystemメッセージ
  if (themeHistories[theme].length === 0) {
    themeHistories[theme].push({
      role: 'system',
      content: `「${theme}」について、あなたが大切にしていることや感じていることを教えてください。`
    })
  }
  userInput.value = ''
}

async function sendUserMessage() {
  if (!userInput.value) return
  themeHistories[currentTheme.value].push({ role: 'user', content: userInput.value })
  loading.value = true
  try {
    const res = await fetch('/api/ideal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        themeOrder: themeOrder.value,
        themeHistories: JSON.parse(JSON.stringify(themeHistories)),
        currentTheme: currentTheme.value,
        history: themeHistories[currentTheme.value],
        finish: false
      })
    })
    const data = await res.json()
    themeHistories[currentTheme.value].push({ role: 'assistant', content: data.reply })
    turnCount.value += 1
    if (turnCount.value >= 3) {
      finishedThemes.value.push(currentTheme.value)
      if (themeOrder.value.length < 3 && remainingThemes.value.length > 0) {
        step.value = 'nextOrResult'
      } else if (themeOrder.value.length === 3) {
        step.value = 'allDone'
      }
    }
  } catch (e) {
    themeHistories[currentTheme.value].push({ role: 'assistant', content: 'エラーが発生しました。' })
  }
  userInput.value = ''
  loading.value = false
}

function goToDiagnosis() {
  // APIへthemeOrder/themeHistories/現在の自分データを送信し、診断結果ページへ遷移
  loading.value = true
  progress.value = 0
  // localStorageから現在の自分の診断データを取得
  let currentFactorScores = null
  let currentResultText = ''
  try {
    const cfs = localStorage.getItem('currentFactorScores')
    if (cfs) currentFactorScores = JSON.parse(cfs)
    const crt = localStorage.getItem('currentResultText')
    if (crt) currentResultText = crt
  } catch (e) {}

  // 進捗率アニメーション
  const duration = 2500 // API応答が遅い場合はこの値を調整
  const interval = 30
  let elapsed = 0
  const timer = setInterval(() => {
    elapsed += interval
    progress.value = Math.min(100, Math.round((elapsed / duration) * 100))
  }, interval)

  // 性別もlocalStorageから取得
  let gender = ''
  try {
    const g = localStorage.getItem('gender')
    if (g) gender = g
  } catch (e) {}

  fetch('/api/ideal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      themeOrder: themeOrder.value,
      themeHistories: JSON.parse(JSON.stringify(themeHistories)),
      currentFactorScores,
      currentResultText,
      finish: true,
      gender
    })
  })
    .then(res => res.json())
    .then(async data => {
      // 画像生成API呼び出し
      let dalleResult = {}
      try {
        // 理想の自分像テキストがあれば画像生成
        if (data.idealSummary) {
          const dalleRes = await fetch('/api/dalle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: data.idealSummary })
          })
          dalleResult = await dalleRes.json()
        }
      } catch (e) {
        dalleResult = { error: '画像生成API呼び出しに失敗しました' }
      }
      // 診断結果データに画像生成結果を追加
      const resultWithImage = { ...data, ...dalleResult }
      sessionStorage.setItem('ideal_themeOrder', JSON.stringify(themeOrder.value))
      sessionStorage.setItem('ideal_themeHistories', JSON.stringify(themeHistories))
      sessionStorage.setItem('ideal_result', JSON.stringify(resultWithImage))
      progress.value = 100
      clearInterval(timer)
      setTimeout(() => {
        router.push('/ideal-result')
        loading.value = false
        progress.value = null
      }, 300)
    })
    .catch(() => {
      clearInterval(timer)
      alert('診断結果の取得に失敗しました。')
      loading.value = false
      progress.value = null
    })
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
.chat-area {
  min-height: 200px;
}
.chat-user {
  text-align: right;
}
.chat-ai {
  text-align: left;
}
.ideal-bg {
  min-height: 100vh;
  background: linear-gradient(180deg, #3a4668 0%, #b0c4de 100%);
}
</style>
