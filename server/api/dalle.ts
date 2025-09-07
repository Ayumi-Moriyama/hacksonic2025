import { defineEventHandler, readBody } from 'h3'
import { Buffer } from 'buffer'

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
    console.log('OpenAI API response:', data)
    if (data.data && data.data[0] && data.data[0].url) {
      try {
        // 画像URLをサーバー側でfetchし、Base64エンコードして返す
        const imageResponse = await fetch(data.data[0].url)
        console.log('画像取得レスポンス:', imageResponse.status, imageResponse.headers)
        if (!imageResponse.ok) {
          // base64生成失敗時はimageUrlも返す
          return { error: `画像取得失敗: status=${imageResponse.status}`, imageUrl: data.data[0].url }
        }
        const arrayBuffer = await imageResponse.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        return { base64, imageUrl: data.data[0].url }
      } catch (imgErr: any) {
        // base64生成失敗時はimageUrlも返す
        return { error: `画像fetch/変換エラー: ${imgErr?.message || imgErr}`, imageUrl: data.data[0].url }
      }
    } else {
      return { error: `画像生成に失敗しました: ${JSON.stringify(data.error || data)}` }
    }
  } catch (e: any) {
    return { error: `APIリクエストに失敗しました: ${e?.message || e}` }
  }
})
