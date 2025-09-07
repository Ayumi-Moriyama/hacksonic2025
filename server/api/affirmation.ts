import { GoogleGenerativeAI } from "@google/generative-ai";
import { readBody } from "h3";

const apiKey = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    event.res.statusCode = 405;
    return "Method Not Allowed";
  }
  try {
    const { idealSummary = "" } = await readBody(event);

    if (!idealSummary) {
      event.res.statusCode = 400;
      return { error: "idealSummary is required" };
    }

    // Geminiプロンプト
    const prompt = `
あなたはポジティブ心理学の専門家です。
以下の「理想の人物像」に近づくために役立つ日本語のアファメーション（肯定的な自己宣言）を3つ考えてください。
それぞれ1文ずつ、箇条書きで出力してください。

理想の人物像: ${idealSummary}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // 箇条書きのアファメーションを配列化＋説明文除外
    const affirmations = text
      .split(/\n+/)
      .map((line) => line.replace(/^[-・\d.]+/, "").trim())
      .filter((line) =>
        line.length > 0 &&
        // 説明文によく使われるフレーズを除外
        !/^はい[、。]/.test(line) &&
        !/アファメーションを[0-9一二三三つ]+考案しました/.test(line) &&
        !/ポジティブ心理学/.test(line) &&
        !/理想の人物像/.test(line) &&
        // 1文のみで「私」「自分」「できる」「ある」など肯定的な自己宣言ワードを含むものだけ
        (/(私|自分|できる|ある|なる|信じて|大丈夫|進む|受け入れる|感謝|成長|挑戦|前向き|笑顔|幸せ|愛|価値|力|強い|努力|続ける|認める|楽しむ|学ぶ|支える|助ける|夢|希望|目標|達成|行動|変化|挑む|信じる|可能性|未来|今|ここ)/.test(line) || line.length <= 25)
      );

    // 3つに限定
    const top3 = affirmations.slice(0, 3);

    // Geminiの返答が3件未満の場合、エラー返却
    if (top3.length < 3) {
      event.res.statusCode = 500;
      return { error: "アファメーションの生成に失敗しました（レスポンス不正）", raw: text };
    }

    return { affirmations: top3 };
  } catch (e) {
    console.error("affirmation.ts error:", e);
    event.res.statusCode = 500;
    return { error: "Internal Server Error" };
  }
});
