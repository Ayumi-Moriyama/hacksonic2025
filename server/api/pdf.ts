import { readFile } from 'fs/promises'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { defineEventHandler } from 'h3'
import path from 'path'

// 折り返し処理用関数
function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/)
  let lines: string[] = []
  let currentLine = ''

  for (let word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

// テキスト描画のラッパー（ページ内に収める版）
function drawWrappedText(page: any, text: string, x: number, y: number, options: any) {
  const { font, size, color, maxWidth, lineHeight } = options
  const lines = wrapText(text, font, size, maxWidth)
  let cursorY = y
  lines.forEach(line => {
    if (cursorY < 50) return // 下端で打ち切る（1ページ制約）
    page.drawText(line, { x, y: cursorY, font, size, color })
    cursorY -= lineHeight
  })
  return cursorY
}

export default defineEventHandler(async (event) => {
  const fontUrl = `${getRequestURL(event).origin}/NotoSansJP-Regular.ttf`
  // const fontPath = path.resolve(process.cwd(), 'public', 'NotoSansJP-Regular.ttf')
  // const fontBytes = await readFile(fontPath)
  const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer())

  const body = await readBody(event)
  const {
    personalityResult = '',
    latestResult = {} as any,
    affirmations = [],
    imageUrl = ''
  } = body || {}

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const pageWidth = 595.28
  const pageHeight = 841.89
  const page = pdfDoc.addPage([pageWidth, pageHeight]) // A4サイズ
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: false })

  let y = pageHeight - 50
  const marginX = 40
  const contentWidth = pageWidth - marginX * 2

  // タイトル
  page.drawText('診断結果レポート', {
    x: pageWidth / 2 - 60,
    y,
    size: 18,
    font: customFont,
    color: rgb(0, 0, 0),
  })
  y -= 40

  // 画像
  let imgDims = { width: 0, height: 0 }
  let imageDrawn = false
  if (imageUrl) {
    try {
      const imgRes = await fetch(imageUrl)
      if (imgRes.ok) {
        const contentType = imgRes.headers.get("content-type") || ""
        const arrayBuffer = await imgRes.arrayBuffer()
        const imageBytes = Buffer.from(arrayBuffer)

        let img
        if (contentType.includes("png")) {
          img = await pdfDoc.embedPng(imageBytes)
        } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          img = await pdfDoc.embedJpg(imageBytes)
        } else {
          throw new Error(`Unsupported image type: ${contentType}`)
        }

        imgDims = img.scale(0.25)
        page.drawImage(img, {
          x: marginX,
          y: y - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        })
        imageDrawn = true
      }
    } catch (e) {
      console.error('画像埋め込み失敗:', e)
    }
  }

  // 理想の人物像
  if (latestResult.idealSummary) {
    const idealX = imageDrawn ? marginX + imgDims.width + 20 : marginX
    const idealY = y
    const idealWidth = imageDrawn ? pageWidth - idealX - 40 : contentWidth

    page.drawText('■ 理想の人物像', {
      x: idealX,
      y: idealY,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    })

    y = drawWrappedText(page, latestResult.idealSummary, idealX, idealY - 18, {
      font: customFont,
      size: 10,
      color: rgb(0, 0, 0),
      maxWidth: idealWidth,
      lineHeight: 13,
    }) - 20
  }

  // 画像の下端にyを揃える
  if (imageDrawn) {
    y = Math.min(y, pageHeight - 50 - imgDims.height) - 20
  }

  // 性格診断
  page.drawText('■ 性格診断の結果', {
    x: marginX,
    y,
    size: 14,
    font: customFont,
    color: rgb(0, 0, 0),
  })
  y -= 18

  if (personalityResult) {
    y = drawWrappedText(page, personalityResult, marginX, y, {
      font: customFont,
      size: 10,
      color: rgb(0, 0, 0),
      maxWidth: contentWidth,
      lineHeight: 13,
    }) - 10
  }

  if (latestResult.gender) {
    y = drawWrappedText(page, `性別: ${latestResult.gender}`, marginX, y, {
      font: customFont,
      size: 10,
      color: rgb(0, 0, 0),
      maxWidth: contentWidth,
      lineHeight: 13,
    }) - 8
  }

  // アドバイス
  if (latestResult.compare) {
    page.drawText('アドバイス:', {
      x: marginX,
      y,
      size: 12,
      font: customFont,
      color: rgb(0, 0, 0),
    })
    y -= 14

    y = drawWrappedText(page, latestResult.compare, marginX, y, {
      font: customFont,
      size: 10,
      color: rgb(0, 0, 0),
      maxWidth: contentWidth,
      lineHeight: 13,
    }) - 10
  }

  // アファメーション
  if (affirmations && affirmations.length > 0) {
    page.drawText('■ おすすめアファメーション', {
      x: marginX,
      y,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    })
    y -= 18

    affirmations.forEach((a: string, i: number) => {
      y = drawWrappedText(page, `${i + 1}. ${a}`, marginX + 10, y, {
        font: customFont,
        size: 10,
        color: rgb(0, 0, 0),
        maxWidth: contentWidth - 20,
        lineHeight: 13,
      }) - 6
    })
  }

  // フッター
  page.drawText('Generated by hacksonic2025', {
    x: pageWidth / 2 - 60,
    y: 30,
    size: 9,
    font: customFont,
    color: rgb(0, 0, 0),
  })

  const pdfBytes = await pdfDoc.save()

  event.node.res.setHeader('Content-Type', 'application/pdf')
  event.node.res.setHeader('Content-Disposition', 'attachment; filename="diagnosis_report.pdf"')
  event.node.res.setHeader('Content-Length', pdfBytes.length)

  return Buffer.from(pdfBytes)
})
