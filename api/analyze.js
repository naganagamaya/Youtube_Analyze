// ===================================================================
//  /api/analyze  —  Gemini API を呼び出すサーバーレス関数
// -------------------------------------------------------------------
//  フロント(index.html)から { prompt } を受け取り、Gemini に投げて
//  生成テキストを { text } で返すだけのシンプルな中継役です。
//
//  ★ APIキーは Vercel の環境変数 GEMINI_API_KEY から読み込みます。
//    ブラウザ側には絶対に出ないので、訪問者にキーは見えません。
//
//  使うモデルを変えたいときは MODEL を書き換えるだけ。
//  （無料枠が太いのは gemini-2.5-flash / gemini-2.5-flash-lite）
// ===================================================================

const MODEL = "gemini-2.5-flash";

export default async function handler(req, res) {
  // POST以外は弾く
  if (req.method !== "POST") {
    res.status(405).json({ error: "POSTメソッドで呼び出してください" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "GEMINI_API_KEY が設定されていません。Vercelの環境変数を確認してください。",
    });
    return;
  }

  try {
    // Vercelは Content-Type: application/json のbodyを自動でパースします
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const prompt = body && body.prompt;
    if (!prompt) {
      res.status(400).json({ error: "prompt がありません" });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          // JSONで返すよう指定（フロント側でそのままパースできる）
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      res.status(geminiRes.status).json({
        error: "Gemini APIエラー: " + errText.slice(0, 300),
      });
      return;
    }

    const data = await geminiRes.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // 1分間キャッシュ（同じ分析を連打してもムダ呼びしない）
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "サーバーエラー: " + (e.message || e) });
  }
}
