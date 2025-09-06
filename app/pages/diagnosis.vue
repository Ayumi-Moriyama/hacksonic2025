<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">現在の自分を診断</h2>
        <div v-if="!finished">
          <v-card>
            <v-card-title class="text-center">
              {{ questions[currentQuestion].label }}
            </v-card-title>
            <v-card-text>
              <v-radio-group
                v-model="answers[questions[currentQuestion].key]"
                :mandatory="true"
                :disabled="finished"
              >
                <v-radio
                  v-for="option in questions[currentQuestion].options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></v-radio>
              </v-radio-group>
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
          <h3>あなたの現在の特徴</h3>
          <div v-for="(score, key) in factorScores" :key="key" class="mb-2">
            <strong>{{ factorLabels[key] }}:</strong> {{ score }} / 5
          </div>
          <div class="mt-4 mb-4">
            <p>{{ resultText }}</p>
          </div>
          <v-divider class="my-6"></v-divider>
          <h3>理想の自分像を入力してください</h3>
          <v-textarea
            v-model="idealSelf"
            label="理想の自分像（自由記述またはキーワード）"
            rows="3"
            auto-grow
          ></v-textarea>
          <v-btn color="primary" class="mt-4" @click="generateIdealImage" :disabled="!idealSelf || generatingImage">
            理想の自分のイメージ画像を生成
          </v-btn>
          <div v-if="imageUrl" class="mt-6">
            <h4>理想の自分のイメージ</h4>
            <v-img :src="imageUrl" max-width="400" class="mx-auto mt-4" />
          </div>
          <div v-if="imageError" class="mt-4 red--text">
            画像生成に失敗しました。
          </div>
        </div>
        <div v-if="finished" class="mt-8 text-center">
          <v-btn color="secondary" class="mt-6" @click="goToIdeal">
            理想の自分を診断
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const questions = [
  // Big Five
  {
    key: 'extraversion1',
    label: '私は人と話すことが好きだ',
    factor: 'extraversion',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'extraversion2',
    label: '私は活発でエネルギッシュだ',
    factor: 'extraversion',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'agreeableness1',
    label: '私は他人に親切に接する',
    factor: 'agreeableness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'agreeableness2',
    label: '私は他人の気持ちを考える',
    factor: 'agreeableness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'conscientiousness1',
    label: '私は計画的に行動する',
    factor: 'conscientiousness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'conscientiousness2',
    label: '私は責任感が強い',
    factor: 'conscientiousness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'neuroticism1',
    label: '私はストレスを感じやすい',
    factor: 'neuroticism',
    reverse: true,
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'neuroticism2',
    label: '私は不安になりやすい',
    factor: 'neuroticism',
    reverse: true,
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'openness1',
    label: '私は新しい経験に積極的だ',
    factor: 'openness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'openness2',
    label: '私は創造的なことが好きだ',
    factor: 'openness',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  // Schwartz
  {
    key: 'selfDirection',
    label: '自分の信念や考えを大切にする',
    factor: 'selfDirection',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'stimulation',
    label: '刺激的で変化のある生活を求める',
    factor: 'stimulation',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'universalism',
    label: '他者や自然を思いやる',
    factor: 'universalism',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'benevolence',
    label: '家族や友人との絆を大切にする',
    factor: 'benevolence',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'tradition',
    label: '伝統や慣習を守る',
    factor: 'tradition',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  },
  {
    key: 'achievement',
    label: '社会的地位や成功を重視する',
    factor: 'achievement',
    options: [
      { label: '1: 全く当てはまらない', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5: 非常に当てはまる', value: 5 }
    ]
  }
]

const factorLabels = {
  extraversion: '外向性',
  agreeableness: '協調性',
  conscientiousness: '誠実性',
  neuroticism: '情緒安定性',
  openness: '開放性',
  selfDirection: '自己方向性',
  stimulation: '刺激',
  universalism: '普遍主義',
  benevolence: '親密性',
  tradition: '伝統',
  achievement: '達成'
}

const currentQuestion = ref(0)
const answers = ref({})
questions.forEach(q => { answers.value[q.key] = null })

const finished = ref(false)
const resultText = ref('')
const idealSelf = ref('')
const imageUrl = ref('')
const imageError = ref(false)
const generatingImage = ref(false)

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

const factorScores = computed(() => {
  // 各因子ごとに該当設問の平均値を算出
  const factors = {}
  questions.forEach(q => {
    if (!factors[q.factor]) factors[q.factor] = []
    let val = answers.value[q.key]
    if (q.reverse && val !== null) {
      val = 6 - val // 逆スコア化
    }
    if (val !== null) factors[q.factor].push(val)
  })
  const scores = {}
  Object.keys(factors).forEach(f => {
    if (factors[f].length > 0) {
      const avg = factors[f].reduce((a, b) => a + b, 0) / factors[f].length
      scores[f] = Math.round(avg * 10) / 10 // 小数1桁
    }
  })
  return scores
})

function submitDiagnosis() {
  finished.value = true
  // 結果テキスト生成
  const scores = factorScores.value
  let text = ''
  Object.keys(scores).forEach(f => {
    text += `${factorLabels[f]}: ${scores[f]} / 5\n`
  })
  // 簡易解説
  text += '\nあなたの特徴:\n'
  if (scores.extraversion >= 4) text += '・外向的で社交的な傾向があります。\n'
  if (scores.agreeableness >= 4) text += '・協調性が高く、他者に配慮できます。\n'
  if (scores.conscientiousness >= 4) text += '・誠実で計画的に行動できます。\n'
  if (scores.neuroticism >= 4) text += '・やや不安やストレスを感じやすい傾向があります。\n'
  if (scores.openness >= 4) text += '・新しい経験や創造的な活動を好みます。\n'
  if (scores.selfDirection >= 4) text += '・自分の信念を大切にします。\n'
  if (scores.stimulation >= 4) text += '・刺激や変化を求める傾向があります。\n'
  if (scores.universalism >= 4) text += '・他者や自然への思いやりが強いです。\n'
  if (scores.benevolence >= 4) text += '・家族や友人との絆を重視します。\n'
  if (scores.tradition >= 4) text += '・伝統や慣習を大切にします。\n'
  if (scores.achievement >= 4) text += '・社会的な成功や達成を重視します。\n'
  resultText.value = text
}

async function generateIdealImage() {
  generatingImage.value = true
  imageError.value = false
  imageUrl.value = ''
  try {
    const prompt = `理想の自分像: ${idealSelf.value}。日本人男女の人物イラスト。`
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
function goToIdeal() {
  // 診断結果をlocalStorageに保存
  localStorage.setItem('currentFactorScores', JSON.stringify(factorScores.value))
  localStorage.setItem('currentResultText', resultText.value)
  window.location.href = '/ideal'
}
</script>

<style scoped>
.mb-6 {
  margin-bottom: 2rem;
}
</style>
