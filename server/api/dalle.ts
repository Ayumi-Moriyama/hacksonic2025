import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body.prompt

  if (!prompt) {
    return { error: 'プロンプトがありません' }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { error: 'OpenAI APIキーが設定されていません' }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '512x512'
      })
    })
    const data = await response.json()
    if (data.data && data.data[0] && data.data[0].url) {
      return { url: data.data[0].url }
    } else {
      return { error: '画像生成に失敗しました' }
    }
  } catch (e) {
    return { error: 'APIリクエストに失敗しました' }
  }
})
