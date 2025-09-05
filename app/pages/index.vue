<template>
  <div>
    <h1>理想の自分を可視化するツール</h1>
    <form @submit.prevent="submitAnswers">
      <div>
        <label>アウトドアかインドアどちらが好きですか？</label>
        <select v-model="answers.outdoorIndoor">
          <option value="outdoor">アウトドア</option>
          <option value="indoor">インドア</option>
        </select>
      </div>
      <div>
        <label>仕事とプライベートどちらが大切ですか？</label>
        <select v-model="answers.workLife">
          <option value="work">仕事</option>
          <option value="life">プライベート</option>
        </select>
      </div>
      <div>
        <label>趣味は何ですか？</label>
        <input type="text" v-model="answers.hobby" />
      </div>
      <div>
        <label>理想の職業は何ですか？</label>
        <input type="text" v-model="answers.idealJob" />
      </div>
      <div>
        <label>どのような生活スタイルを望んでいますか？</label>
        <input type="text" v-model="answers.lifestyle" />
      </div>
      <button type="submit">送信</button>
    </form>
    <div v-if="result">
      <h2>あなたの理想の自分</h2>
      <p>{{ result }}</p>
      <img v-if="imageUrl" :src="imageUrl" alt="生成されたイメージ" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      answers: {
        outdoorIndoor: '',
        workLife: '',
        hobby: '',
        idealJob: '',
        lifestyle: ''
      },
      result: '',
      imageUrl: ''
    };
  },
  methods: {
    async submitAnswers() {
      let lifestyleAdvice = this.answers.outdoorIndoor === 'outdoor' ? '活動的なライフスタイル' : '落ち着いたライフスタイル';
      let workLifeBalance = this.answers.workLife === 'work' ? 'キャリア重視の生活' : 'バランスの取れた生活';
      this.result = `あなたの理想の自分は、${lifestyleAdvice}を持ち、${workLifeBalance}を目指しています。趣味は${this.answers.hobby}で、理想の職業は${this.answers.idealJob}です。`;

      // DALL-E APIを呼び出してイメージを生成
      const prompt = `理想の自分: ${this.answers.hobby}, ${this.answers.idealJob}, ${this.answers.lifestyle}`;
      try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });
        this.imageUrl = response.data.data[0].url;
      } catch (error) {
        console.error('イメージ生成に失敗しました:', error);
        this.imageUrl = '';
      }
    }
  }
};
</script>

<style scoped>
/* スタイルを追加 */
</style>
