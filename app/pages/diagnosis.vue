<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">診断スタート</h2>
        <div v-if="!finished">
          <v-card>
            <v-card-title class="text-center">
              {{ questions[currentQuestion].label }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="answers[questions[currentQuestion].key]"
                :label="questions[currentQuestion].placeholder"
                required
                @keyup.enter="nextQuestion"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn text @click="prevQuestion" :disabled="currentQuestion === 0">戻る</v-btn>
              <v-btn color="primary" @click="nextQuestion" :disabled="!answers[questions[currentQuestion].key]">
                {{ isLastQuestion ? '診断結果を見る' : '次へ' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div v-else class="mt-8 text-center">
          <h3>あなたの理想の自分</h3>
          <p>{{ result }}</p>
          <v-img v-if="imageUrl" :src="imageUrl" max-width="400" class="mx-auto mt-4" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const questions = [
  {
    key: 'jobStyle',
    label: '仕事（お金含む）',
    placeholder: '理想の働き方は？'
  },
  {
    key: 'moneyValue',
    label: '仕事（お金含む）',
    placeholder: 'お金に対する価値観は？'
  },
  {
    key: 'relationship',
    label: '人間関係（恋愛含む）',
    placeholder: '理想の人間関係は？'
  },
  {
    key: 'love',
    label: '人間関係（恋愛含む）',
    placeholder: '恋愛で大切にしたいことは？'
  },
  {
    key: 'timeUsage',
    label: '時間の使い方',
    placeholder: '理想の時間の使い方は？'
  },
  {
    key: 'hobby',
    label: '時間の使い方',
    placeholder: '趣味や余暇の過ごし方は？'
  }
]

const currentQuestion = ref(0)
const answers = ref({
  jobStyle: '',
  moneyValue: '',
  relationship: '',
  love: '',
  timeUsage: '',
  hobby: ''
})
const finished = ref(false)
const result = ref('')
const imageUrl = ref('')

const isLastQuestion = computed(() => currentQuestion.value === questions.length - 1)

function nextQuestion() {
  if (!answers.value[questions[currentQuestion.value].key]) return
  if (isLastQuestion.value) {
    submitDiagnosis()
  } else {
    currentQuestion.value++
  }
}
function prevQuestion() {
  if (currentQuestion.value > 0) currentQuestion.value--
}

async function submitDiagnosis() {
  finished.value = true
  // 診断結果テキスト生成
  result.value = `あなたの理想の働き方は「${answers.value.jobStyle}」、お金に対する価値観は「${answers.value.moneyValue}」。
理想の人間関係は「${answers.value.relationship}」、恋愛で大切にしたいことは「${answers.value.love}」。
理想の時間の使い方は「${answers.value.timeUsage}」、趣味や余暇の過ごし方は「${answers.value.hobby}」です。`

  // DALL-E用プロンプト生成（人物イラストを明示）
  const prompt = `理想の自分をイメージした日本人男女の人物イラスト。仕事は${answers.value.jobStyle}、お金は${answers.value.moneyValue}、人間関係は${answers.value.relationship}、恋愛は${answers.value.love}、時間の使い方は${answers.value.timeUsage}、趣味は${answers.value.hobby}。`

  try {
    const res = await fetch('/api/dalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    imageUrl.value = data.url
    if (!data.url) {
      result.value += '\n画像生成に失敗しました。'
    }
  } catch (e) {
    imageUrl.value = ''
    result.value += '\n画像生成に失敗しました。'
  }
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
</style>
