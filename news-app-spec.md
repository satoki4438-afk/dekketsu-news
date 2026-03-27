# 「で、結局どうなの？」仕様書
> バカでもわかるニュース解説メディア

---

## 概要

毎朝AIが自動でニュースを収集・解説し、「生活にどう影響するか」まで伝えるWebメディア。ユーザー操作ゼロ、毎朝6時に自動更新。

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | Next.js (App Router) |
| ホスティング | Vercel |
| 自動実行 | Vercel Cron Jobs |
| AI | Claude API (claude-sonnet-4-20250514) with web_search tool |
| DB | Firestore |
| スタイル | Tailwind CSS |

---

## ディレクトリ構成

```
/
├── app/
│   ├── page.tsx              # トップページ（記事一覧）
│   ├── article/[id]/page.tsx # 記事詳細ページ
│   └── api/
│       └── generate/route.ts # Cron から呼ばれる記事生成API
├── lib/
│   ├── claude.ts             # Claude API呼び出し
│   └── firestore.ts          # Firestore操作
├── components/
│   ├── ArticleCard.tsx       # 記事カード
│   ├── ArticleFull.tsx       # 記事全文
│   └── Header.tsx
└── vercel.json               # Cron設定
```

---

## Vercel Cron設定

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/generate",
      "schedule": "0 21 * * *"
    }
  ]
}
```
※ Vercel CronはUTC基準。21:00 UTC = 日本時間06:00

---

## 記事生成API（/api/generate）

### 処理フロー

```
1. CRON_SECRET検証（不正アクセス防止）
2. Claude APIにweb_searchツールで本日のニュース検索を依頼
3. 選定ルールに基づき3〜6本のニュースを選定
4. 各ニュースについて記事フォーマットで解説生成
5. Firestoreに保存
6. 完了
```

### ニュース選定ルール（Claude APIへのシステムプロンプト）

```
以下の優先順位でニュースを3〜6本選定してください：

1. 日本人の生活・家計に直接影響するもの（物価、給与、税金、社会保障など）
2. 海外メディアと日本メディアで論調が異なるもの
3. 経済・政治・社会のハードニュース（軟派なニュースは避ける）
4. 難しい専門用語が多いもの（わかりやすく解説する価値が高い）

除外：
- 芸能・スポーツ・事件事故（生活影響が薄いもの）
- 1週間以上前のニュース
- 既に昨日取り上げたトピック
```

### 記事生成フォーマット（Claude APIへの指示）

```
各ニュースについて以下のJSON形式で出力してください：

{
  "title": "キャッチーで小学生でもわかるタイトル（30文字以内）",
  "category": "経済 | 政治 | 社会 | 国際 | 生活",
  "emoji": "記事に合う絵文字1つ",
  "publishedAt": "ISO8601形式",
  "fact": "3行以内の事実のみの要約",
  "japan_view": "日本メディアの論調（100文字）",
  "japan_tone": "論調を一言で（例：政府より、楽観的、煽り気味）",
  "world_view": "海外メディアの論調（100文字）",
  "world_tone": "論調を一言で（例：懐疑的、批判的、冷静）",
  "gap_analysis": "日本と海外の視点の差異（150文字）",
  "impacts": [
    {
      "icon": "絵文字",
      "title": "影響のタイトル",
      "body": "具体的な影響（小学生でもわかる言葉で）"
    }
  ],
  "actions": [
    "読者が今日から取れる具体的なアクション（3つ）"
  ],
  "related_keywords": ["SEO用キーワード3〜5個"]
}
```

---

## Firestoreデータ構造

```
/articles/{articleId}
  - id: string
  - title: string
  - category: string
  - emoji: string
  - publishedAt: Timestamp
  - fact: string
  - japan_view: string
  - japan_tone: string
  - world_view: string
  - world_tone: string
  - gap_analysis: string
  - impacts: array
  - actions: array
  - related_keywords: array
  - createdAt: Timestamp
```

---

## トップページ（/）

- 最新6件の記事カードを表示
- カテゴリフィルター（全部 / 経済 / 政治 / 社会 / 国際）
- 「今日のニュース」ヘッダー
- 各カードに：タイトル・カテゴリ・emoji・factの1行・公開日時

---

## 記事詳細ページ（/article/[id]）

デモHTMLと同じ構成：
1. カテゴリタグ＋タイトル
2. 📋 3行ファクト
3. 🌐 日本vs海外比較（2カラム）
4. 💥 ワイらどうなる？（影響リスト）
5. 💡 どう動く？（アクションリスト）
6. 関連記事（同カテゴリの直近3件）

---

## 環境変数

```
ANTHROPIC_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CRON_SECRET=          # Cron不正アクセス防止用ランダム文字列
```

---

## デプロイ手順

1. GitHubリポジトリ作成
2. `npx create-next-app@latest` でプロジェクト作成
3. 上記ファイル構成で実装
4. Vercelにデプロイ（GitHubと連携）
5. 環境変数をVercelダッシュボードに設定
6. vercel.jsonのCron設定を確認
7. 手動でCronを1回叩いて動作確認

---

## Phase 2（後で追加）

- AdSense設置
- アフィリエイトリンク自動挿入（記事カテゴリに応じて）
- OGP画像自動生成（SNSシェア用）
- メールマガジン登録フォーム
- X自動投稿（記事生成後にXへ投稿）
