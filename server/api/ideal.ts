import type { IncomingMessage, ServerResponse } from 'http'
import { OpenAI } from 'openai'

const apiKey = process.env.OPENAI_API_KEY || ''

const openai = new OpenAI({ apiKey })

export default async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  let body = ''
  req.on('data', chunk => {
    body += chunk
  })
  req.on('end', async () => {
    try {
      const { history, currentFactorScores, currentResultText } = JSON.parse(body)

      // チャット履歴をOpenAI API用に変換
      const messages = history.map((msg: any) => {
        if (msg.role === 'user') return { role: 'user', content: msg.content }
        if (msg.role === 'assistant') return { role: 'assistant', content: msg.content }
        // systemは最初のプロンプトとしてuser扱い
        return { role: 'user', content: msg.content }
      })

      // チャットが5往復以上 or 「まとめ」などのキーワードで診断終了
      const finish = history.length >= 8 || (history[history.length - 1]?.content?.includes('まとめ') || history[history.length - 1]?.content?.includes('要約'))

      if (!finish) {
        // 深掘り質問を生成
        const completion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'あなたはユーザーの理想の自分像を深掘りするカウンセラーです。1回の返答は1～2文で、ユーザーの回答を受けてさらに深掘りする質問をしてください。' },
            ...messages
          ],
          max_tokens: 100
        })
        const reply = completion.data.choices[0].message?.content || 'もう少し詳しく教えてください。'
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ reply }))
        return
      } else {
        // 理想の自分像の要約
        const summaryCompletion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '以下はユーザーとカウンセラーの理想の自分像に関する対話です。内容をもとに、ユーザーの理想の自分像を1文で簡潔に日本語で要約してください。' },
            ...messages
          ],
          max_tokens: 100
        })
        const summary = summaryCompletion.data.choices[0].message?.content || ''

        // 現在の自分の診断結果と理想の自分像を比較し、共通点・相違点・アドバイスを生成
        const comparePrompt = `
あなたはキャリアカウンセラーです。
以下はユーザーの現在の診断結果と理想の自分像です。
- 現在の自分の診断結果（スコア）: ${JSON.stringify(currentFactorScores)}
- 現在の自分の診断結果（テキスト）: ${currentResultText}
- 理想の自分像: ${summary}

これらを比較し、共通点・相違点・今後のアドバイスを日本語で簡潔にまとめてください。
`
        const compareCompletion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: comparePrompt }
          ],
          max_tokens: 200
        })
        const compare = compareCompletion.data.choices[0].message?.content || ''

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ finish: true, summary, compare }))
        return
      }
    } catch (e) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: 'Internal Server Error' }))
    }
  })
}
