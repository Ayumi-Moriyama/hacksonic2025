import { OpenAI } from 'openai'
import { readBody } from 'h3'

const apiKey = process.env.OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey })

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    event.res.statusCode = 405
    return 'Method Not Allowed'
  }
  try {
    const { history, currentFactorScores, currentResultText, finish = false } = await readBody(event)

    // チャット履歴をOpenAI API用に変換
    const messages = history.map((msg: any) => {
      if (msg.role === 'user') return { role: 'user', content: msg.content }
      if (msg.role === 'assistant') return { role: 'assistant', content: msg.content }
      // systemは最初のプロンプトとしてuser扱い
      return { role: 'user', content: msg.content }
    })

    if (!finish) {
      // 深掘り質問を生成
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'あなたはユーザーの理想の自分像を深掘りするカウンセラーです。1回の返答は1～2文で、ユーザーの回答を受けてさらに深掘りする質問をしてください。' },
          ...messages
        ],
        max_tokens: 100
      })
      const reply = completion.choices[0].message?.content || 'もう少し詳しく教えてください。'
      return { reply }
    } else {
      // 理想の自分像の要約
      const summaryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '以下はユーザーとカウンセラーの理想の自分像に関する対話です。内容をもとに、ユーザーの理想の自分像を1文で簡潔に日本語で要約してください。' },
          ...messages
        ],
        max_tokens: 100
      })
      const summary = summaryCompletion.choices[0].message?.content || ''

      // 現在の自分の診断結果と理想の自分像を比較し、共通点・相違点・アドバイスを生成
      const comparePrompt = `
あなたはキャリアカウンセラーです。
以下はユーザーの現在の診断結果と理想の自分像です。
- 現在の自分の診断結果（スコア）: ${JSON.stringify(currentFactorScores)}
- 現在の自分の診断結果（テキスト）: ${currentResultText}
- 理想の自分像: ${summary}

これらを比較し、共通点・相違点・今後のアドバイスを日本語で簡潔にまとめてください。
`
      const compareCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: comparePrompt }
        ],
        max_tokens: 200
      })
      const compare = compareCompletion.choices[0].message?.content || ''

      return { finish: true, summary, compare }
    }
  } catch (e) {
    console.error('ideal.ts error:', e)
    event.res.statusCode = 500
    return { error: 'Internal Server Error' }
  }
})