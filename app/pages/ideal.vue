<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">理想の自分を診断</h2>
        <div v-if="step === 0">
          <v-card class="mb-6">
            <v-card-title class="text-center">
              あなたが一番自分らしくいられる時間は？
            </v-card-title>
            <v-card-text>
              <v-btn
                block
                color="primary"
                class="mb-2"
                @click="selectInitial('仕事をしているとき')"
              >
                仕事をしているとき
              </v-btn>
              <v-btn
                block
                color="primary"
                class="mb-2"
                @click="selectInitial('人と過ごすとき')"
              >
                人と過ごすとき
              </v-btn>
              <v-btn
                block
                color="primary"
                class="mb-2"
                @click="selectInitial('自分だけで過ごすひととき')"
              >
                自分だけで過ごすひととき
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
        <div v-else>
          <div class="chat-area mb-4">
            <div v-for="(msg, i) in chatHistory" :key="i" :class="msg.role === 'user' ? 'chat-user' : 'chat-ai'">
              <v-card :color="msg.role === 'user' ? 'blue lighten-5' : 'grey lighten-4'" class="pa-3 mb-2">
                <div>{{ msg.content }}</div>
              </v-card>
            </div>
          </div>
          <v-text-field
            v-model="userInput"
            label="メッセージを入力"
            :disabled="loading || finished"
            @keyup.enter="sendUserMessage"
            append-inner-icon="mdi-send"
            @click:append-inner="sendUserMessage"
          ></v-text-field>
          <v-btn color="primary" class="mt-2" :disabled="!userInput || loading || finished" @click="sendUserMessage">
            送信
          </v-btn>
        </div>
        <div v-if="finished" class="mt-8 text-center">
          <h3>理想の自分像</h3>
          <p>{{ idealSummary }}</p>
          <v-btn color="primary" class="mt-4" @click="generateIdealImage" :disabled="generatingImage">
            理想の自分のイメージ画像を生成
          </v-btn>
          <div v-if="imageUrl" class="mt-6">
            <h4>理想の自分のイメージ</h4>
            <v-img :src="imageUrl" max-width="400" class="mx-auto mt-4" />
          </div>
          <div v-if="imageError" class="mt-4 red--text">
            画像生成に失敗しました。
          </div>
          <v-divider class="my-6"></v-divider>
          <h3>現在の自分との比較・アドバイス</h3>
          <div v-if="compareText">
            <p>{{ compareText }}</p>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const step = ref(0)
const chatHistory = ref([])
const userInput = ref('')
const loading = ref(false)
const finished = ref(false)
const idealSummary = ref('')
const imageUrl = ref('')
const imageError = ref(false)
const generatingImage = ref(false)
const compareText = ref('')

// 現在の自分の診断結果
const currentFactorScores = ref(null)
const currentResultText = ref('')

onMounted(() => {
  // localStorageから現在の自分の診断結果を取得
  try {
    const scores = localStorage.getItem('currentFactorScores')
    const text = localStorage.getItem('currentResultText')
    if (scores) currentFactorScores.value = JSON.parse(scores)
    if (text) currentResultText.value = text
  } catch (e) {}
})

function selectInitial(choice) {
  step.value = 1
  chatHistory.value.push({
    role: 'system',
    content: `あなたが一番自分らしくいられる時間は「${choice}」なのですね。もう少し詳しく教えてください。`
  })
}

async function sendUserMessage() {
  if (!userInput.value) return
  chatHistory.value.push({ role: 'user', content: userInput.value })
  loading.value = true
  // サーバーAPIでAI返答を取得
  try {
    const res = await fetch('/api/ideal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: chatHistory.value,
        currentFactorScores: currentFactorScores.value,
        currentResultText: currentResultText.value
      })
    })
    const data = await res.json()
    if (data.finish) {
      finished.value = true
      idealSummary.value = data.summary
      compareText.value = data.compare
    } else {
      chatHistory.value.push({ role: 'assistant', content: data.reply })
    }
  } catch (e) {
    chatHistory.value.push({ role: 'assistant', content: 'エラーが発生しました。' })
  }
  userInput.value = ''
  loading.value = false
}

async function generateIdealImage() {
  generatingImage.value = true
  imageError.value = false
  imageUrl.value = ''
  try {
    const prompt = `理想の自分像: ${idealSummary.value}。日本人男女の人物イラスト。`
    const res = await fetch('/api/dalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    if (data.url) {
      imageUrl.value = data.url
    } else {
      imageError.value = true
    }
  } catch (e) {
    imageError.value = true
  }
  generatingImage.value = false
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
</style>
