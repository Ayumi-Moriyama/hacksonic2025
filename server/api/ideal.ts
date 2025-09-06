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
    const {
      themeOrder = [],
      themeHistories = {},
      currentFactorScores,
      currentResultText,
      finish = false,
      currentTheme = '',
      history = []
    } = await readBody(event)

    // チャット深掘り中：従来通りAI返答のみ返す
    if (!finish) {
      // 現在のテーマの履歴を使って深掘り質問を生成
      const messages = (history.length > 0 ? history : (themeHistories[currentTheme] || [])).map((msg: any) => {
        if (msg.role === 'user') return { role: 'user', content: msg.content }
        if (msg.role === 'assistant') return { role: 'assistant', content: msg.content }
        // systemは最初のプロンプトとしてuser扱い
        return { role: 'user', content: msg.content }
      })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'あなたはユーザーの価値観や理想像を深掘りするカウンセラーです。1回の返答は1～2文で、ユーザーの回答を受けてさらに深掘りする質問をしてください。' },
          ...messages
        ],
        max_tokens: 100
      })
      const reply = completion.choices[0].message?.content || 'もう少し詳しく教えてください。'
      return { reply }
    }

    // 診断結果生成
    // 1. 選択順・各テーマの深掘り内容から理想の人物像を要約
    let themeSummaryPrompt = `あなたはキャリアカウンセラーです。
ユーザーは以下の3つの価値観テーマについて、選択順に深掘りチャットを行いました。
- テーマの選択順（重視する価値観の優先度）: ${themeOrder.join(' → ')}
- 各テーマの深掘りチャット履歴:
`
    for (const theme of themeOrder) {
      themeSummaryPrompt += `\n【${theme}】\n`
      const historyArr = themeHistories[theme] || []
      for (const msg of historyArr) {
        themeSummaryPrompt += `${msg.role === 'user' ? 'ユーザー' : 'カウンセラー'}: ${msg.content}\n`
      }
    }
    themeSummaryPrompt += `
上記をもとに、ユーザーの理想の人物像を1～2文で簡潔に日本語で要約してください。`

    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: themeSummaryPrompt }
      ],
      max_tokens: 120
    })
    const idealSummary = summaryCompletion.choices[0].message?.content || ''

    // 2. その要約文をdalle APIに渡して画像生成
    let imageUrl = ''
    try {
      const dalleRes = await fetch('http://localhost:3000/api/dalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `理想の人物像: ${idealSummary}。日本人男女の人物イラスト。` })
      })
      const dalleData = await dalleRes.json()
      if (dalleData.url) {
        imageUrl = dalleData.url
      }
    } catch (e) {
      imageUrl = ''
    }

    // 3. 現在の自分との共通点・相違点・アドバイスを生成
    const comparePrompt = `
あなたはキャリアカウンセラーです。
- 現在の自分の診断結果（スコア）: ${JSON.stringify(currentFactorScores)}
- 現在の自分の診断結果（テキスト）: ${currentResultText}
- 理想の人物像: ${idealSummary}

これらを比較し、共通点・相違点・理想の自分に近づくためのアドバイスを日本語で簡潔にまとめてください。
`
    const compareCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: comparePrompt }
      ],
      max_tokens: 200
    })
    const compare = compareCompletion.choices[0].message?.content || ''

    // 4. まとめて返却
    return {
      finish: true,
      idealSummary,
      imageUrl,
      compare
    }
  } catch (e) {
    console.error('ideal.ts error:', e)
    event.res.statusCode = 500
    return { error: 'Internal Server Error' }
  }
})
