<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h2 class="text-center mb-6">診断スタート</h2>
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">
              仕事（お金含む）
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">
              人間関係（恋愛含む）
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">
              時間の使い方
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <!-- Step 1: 仕事 -->
            <v-stepper-content step="1">
              <v-form ref="form1" v-model="valid[0]">
                <v-text-field
                  v-model="answers.jobStyle"
                  label="理想の働き方は？"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="answers.moneyValue"
                  label="お金に対する価値観は？"
                  required
                ></v-text-field>
                <v-btn color="primary" @click="nextStep" :disabled="!valid[0]">
                  次へ
                </v-btn>
              </v-form>
            </v-stepper-content>

            <!-- Step 2: 人間関係 -->
            <v-stepper-content step="2">
              <v-form ref="form2" v-model="valid[1]">
                <v-text-field
                  v-model="answers.relationship"
                  label="理想の人間関係は？"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="answers.love"
                  label="恋愛で大切にしたいことは？"
                  required
                ></v-text-field>
                <v-btn color="primary" @click="nextStep" :disabled="!valid[1]">
                  次へ
                </v-btn>
                <v-btn text @click="prevStep" class="ml-2">
                  戻る
                </v-btn>
              </v-form>
            </v-stepper-content>

            <!-- Step 3: 時間の使い方 -->
            <v-stepper-content step="3">
              <v-form ref="form3" v-model="valid[2]">
                <v-text-field
                  v-model="answers.timeUsage"
                  label="理想の時間の使い方は？"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="answers.hobby"
                  label="趣味や余暇の過ごし方は？"
                  required
                ></v-text-field>
                <v-btn color="success" @click="submitDiagnosis" :disabled="!valid[2]">
                  診断結果を見る
                </v-btn>
                <v-btn text @click="prevStep" class="ml-2">
                  戻る
                </v-btn>
              </v-form>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>

        <div v-if="result" class="mt-8 text-center">
          <h3>あなたの理想の自分</h3>
          <p>{{ result }}</p>
          <v-img v-if="imageUrl" :src="imageUrl" max-width="400" class="mx-auto mt-4" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const step = ref(1)
const valid = ref([false, false, false])
const answers = ref({
  jobStyle: '',
  moneyValue: '',
  relationship: '',
  love: '',
  timeUsage: '',
  hobby: ''
})
const result = ref('')
const imageUrl = ref('')

function nextStep() {
  if (step.value < 3) step.value++
}
function prevStep() {
  if (step.value > 1) step.value--
}

async function submitDiagnosis() {
  // 結果テキスト生成
  result.value = `あなたの理想の働き方は「${answers.value.jobStyle}」、お金に対する価値観は「${answers.value.moneyValue}」。
理想の人間関係は「${answers.value.relationship}」、恋愛で大切にしたいことは「${answers.value.love}」。
理想の時間の使い方は「${answers.value.timeUsage}」、趣味や余暇の過ごし方は「${answers.value.hobby}」です。`

  // DALL-E用プロンプト生成
  const prompt = `理想の自分: 仕事は${answers.value.jobStyle}、お金は${answers.value.moneyValue}、人間関係は${answers.value.relationship}、恋愛は${answers.value.love}、時間の使い方は${answers.value.timeUsage}、趣味は${answers.value.hobby}。`

  // サーバーサイドAPI経由で画像生成（仮: /api/dalle）
  try {
    const res = await fetch('/api/dalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    imageUrl.value = data.url
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
