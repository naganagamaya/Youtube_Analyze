# 北海道Vlog チャンネル分析

YouTube StudioのCSVをアップロードすると、**新旧フェアな動画分析・成長予測・AIによる戦略提案**が出るダッシュボードです。
AI部分は Google Gemini（無料枠）で動きます。

---

## 📁 ファイル構成

```
momoko-yt-analyzer/
├── index.html        … ダッシュボード本体（これがサイトのトップ）
├── api/
│   └── analyze.js    … Geminiを呼ぶサーバー関数（APIキーを隠す役割）
├── package.json      … メタ情報（依存ライブラリなし）
└── README.md         … このファイル
```

---

## 🚀 公開のしかた（Vercel）

### 手順1. Gemini APIキーを取得（無料・カード不要）
1. https://aistudio.google.com/apikey にアクセス
2. 「Create API key」でキーを発行
3. `AIza...` で始まる文字列をコピーして控えておく

### 手順2. Vercelにデプロイ
一番かんたんなのは GitHub 経由です。

1. このフォルダごと GitHub にアップ（リポジトリを作成）
2. https://vercel.com にGitHubでログイン →「Add New → Project」
3. このリポジトリを選んで **Import**
4. **Deploy** を押す（設定はデフォルトでOK。フレームワークは「Other」）

> GitHubを使わない場合は、Vercel CLI でも可：
> ```
> npm i -g vercel
> cd momoko-yt-analyzer
> vercel
> ```

### 手順3. APIキーを環境変数に登録（重要）
1. Vercelのプロジェクト画面 → **Settings → Environment Variables**
2. 次を追加：
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 手順1でコピーしたキー
3. 保存したら **Deployments → 最新のデプロイ → Redeploy**（再デプロイで反映）

これで完成。発行されたURL（例 `https://momoko-yt-analyzer.vercel.app`）を
スマホのホーム画面に追加しておくと、アプリのように使えます。

---

## 🧪 動作確認

- まずサイトを開いて「**サンプルで動きを見る**」をクリック → 全機能とAI分析が動けばOK
- 次に本物のCSVをドロップして使う

> AIだけ動かない場合 → 環境変数 `GEMINI_API_KEY` の登録 or 再デプロイを確認。
> 数値・グラフ分析はAIなしでも全部動きます。

---

## 📊 CSVに必要な項目（YouTube Studio）

取り出し方：**Studio → アナリティクス → コンテンツ → 詳細モード → エクスポート → CSV**

| 項目（Studio表記） | 区分 | 用途 |
|---|---|---|
| 動画のタイトル | 必須 | 動画の識別 |
| 動画公開時刻 | 必須 | 新旧フェア比較 |
| 視聴回数 | 必須 | 集客力・1日あたり再生数 |
| 高く評価（いいね） | あると◎ | エンゲージ率 |
| 表示回数 | あると◎ | マップの点の大きさ |
| 表示回数のクリック率 | あると◎ | 本命①サムネ/タイトル評価 |
| 平均再生率 | あると◎ | 本命②視聴維持率 |

最低でも「必須」3つがあれば動きます。

---

## ✏️ あとから編集する（Antigravity / Claude Code）

このプロジェクトはどちらのAIエディタでもそのまま開けます。

### Claude Code の場合
```
cd momoko-yt-analyzer
claude
```
あとは「動画リストに公開日を表示して」「配色を変えて」など日本語で指示すればOK。

### Google Antigravity の場合
フォルダを開いて、同じく自然言語で編集を指示。

### よくある編集ポイント
- **AIの口調や分析内容** → `index.html` 内の `triggerAI()` の `prompt` を編集
- **使うGeminiモデル** → `api/analyze.js` の `MODEL` を変更（例: `gemini-2.5-flash-lite`）
- **配色・フォント** → `index.html` の `<style>` 冒頭 `:root{ ... }` の色変数
- **指標の判定基準** → `index.html` の `renderVideos()`（中央値で4象限を判定）

編集したら GitHub に push すれば Vercel が自動で再デプロイします。

---

## 💡 指標の考え方（このアプリの肝）

- 育てる順番は **① クリック率 → ② 視聴維持率 → ③ エンゲージ率 → ④ 再生数・登録者**
- 再生数は「結果」。追いすぎ注意。①②を改善するのが近道
- 動画比較は古い動画ほど有利なので、**総再生数では評価せず**「1日あたり再生数」と「エンゲージ率（公開日数に左右されない）」でフェアに判定
- 公開2週間未満は「初動計測中」として早すぎる判断を避ける

---

Powered by Gemini ・ Chart.js ・ PapaParse
