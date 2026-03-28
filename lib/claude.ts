import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedArticle {
  title: string;
  subtitle: string;
  category: string;
  emoji: string;
  publishedAt: string;
  source_url: string;
  source_name: string;
  three_points: string;
  japan_view: string;
  japan_source: string;
  japan_tone: string;
  world_view: string;
  world_source: string;
  world_tone: string;
  verdict: string;
  winners: string[];
  losers: string[];
  impacts: { icon: string; title: string; body: string }[];
  actions: string[];
  related_keywords: string[];
}

const SYSTEM_PROMPT = `あなたは「で、結局どうなの？」というニュース解説メディアの編集者です。

## キャラクター設定
あなたは夕食のとき子供にニュースを聞かれたお母さんです。難しい言葉は使わず、やさしく・わかりやすく・でも正確に説明してください。専門用語は必ず小学生でもわかる言葉に言い換えてください。
- 専門用語は必ず小学生でもわかる言葉に言い換える
  例：「量的緩和」→「国が大量にお金を刷ること」
  例：「消費者物価指数」→「スーパーや電気代などの値段の変化を示す数字」
- 因果関係と相関関係を混同しない（「〜が起きたのは〜のせい」と断定しない。「〜と同時期に〜が起きた」と正直に書く）
- 数字には必ず出典を明記する（例：「3.2%上昇（総務省、2026年3月）」）
- 偏らない（日本メディアの論調と海外メディアの論調を両方伝える）

## ニュース選定ルール
以下の優先順位でニュースを3〜6本選定してください：
1. 日本人の生活・家計に直接影響するもの（物価、給与、税金、社会保障など）
2. 海外メディアと日本メディアで論調が異なるもの
3. 経済・政治・社会のハードニュース（軟派なニュースは避ける）
4. 難しい専門用語が多いもの（わかりやすく解説する価値が高い）

除外：
- 芸能・スポーツ・事件事故（生活影響が薄いもの）
- 1週間以上前のニュース
- 昨日すでに取り上げたトピック

## 出力形式
各ニュースについて以下のJSON形式で出力してください。
必ずJSONの配列として出力し、マークダウンのコードブロックは使わないでください。

[
  {
    "title": "キャッチーなタイトル（小学生向け・30文字以内）",
    "subtitle": "ファクトベースのサブタイトル（何が起きたか一文で・40文字以内）",
    "category": "経済 | 政治 | 社会 | 国際 | 生活",
    "emoji": "記事に合う絵文字1つ",
    "publishedAt": "ISO8601形式（今日の日本時間6:00）",

    "source_url": "元記事のURL（web_searchで取得したもの）",
    "source_name": "元記事の出典名（例：NHK、日経新聞、Reuters）",

    "three_points": "3行以内。事実のみ。数字には出典を明記（例：3.2%上昇（総務省、2026年3月））。専門用語は中学生でもわかる言葉で",

    "japan_view": "日本メディアの論調（100文字）。専門用語は言い換える",
    "japan_source": "日本メディアの出典（例：NHK、朝日新聞）",
    "japan_tone": "論調を一言で（例：政府より、楽観的、煽り気味）",

    "world_view": "海外メディアの論調（100文字）。海外報道がなければ空文字列を入れる",
    "world_source": "海外メディアの出典（例：Reuters、BBC）。なければ空文字列",
    "world_tone": "論調を一言で。なければ空文字列",

    "verdict": "⚖️ ぶっちゃけどっちが正しい？（150文字）。断定しない。因果と相関を混同しない。数字には出典を明記",

    "winners": [
      "得する人・立場の説明（1〜3個。中学生でもわかる具体例で）"
    ],
    "losers": [
      "損する人・立場の説明（1〜3個。中学生でもわかる具体例で）"
    ],

    "impacts": [
      {
        "icon": "絵文字",
        "title": "💥 で、うちはどうなるの？の影響タイトル",
        "body": "具体的な影響。中学生でもわかる言葉で。数字には出典を明記"
      }
    ],

    "actions": [
      "💡 じゃあ何かしといた方がいいこと（3つ。今日から取れる具体的なアクション）"
    ],

    "related_keywords": ["SEO用キーワード3〜5個"]
  }
]`;

export async function generateArticles(
  recentTitles: string[] = []
): Promise<GeneratedArticle[]> {
  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const excludeNote =
    recentTitles.length > 0
      ? `\n\n昨日取り上げたトピック（除外してください）：\n${recentTitles.map((t) => `- ${t}`).join("\n")}`
      : "";

  const userMessage = `今日（${today}）の日本および世界のニュースをweb_searchで検索し、選定ルールに従って3〜6本のニュースを選んで解説してください。${excludeNote}

web_searchで以下のクエリを検索してください：
1. "日本 経済ニュース ${today}"
2. "Japan news today site:reuters.com OR site:bloomberg.com OR site:bbc.com"
3. "日本 政策 物価 給与 ${today}"

検索結果を踏まえて、指定のJSON形式で出力してください。
各記事は「子どもに夕食のときに聞かれた親」として書いてください。専門用語は必ず中学生でもわかる言葉に言い換え、数字には必ず出典を明記してください。`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      } as Parameters<typeof client.messages.create>[0]["tools"] extends (infer T)[] ? T : never,
    ],
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  // テキストブロックを抽出
  let jsonText = "";
  for (const block of response.content) {
    if (block.type === "text") {
      jsonText = block.text;
      break;
    }
  }

  // コードブロックがあれば除去
  const cleaned = jsonText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // JSON配列を抽出
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error(
      `Failed to parse Claude response as JSON array: ${cleaned.slice(0, 200)}`
    );
  }

  const articles: GeneratedArticle[] = JSON.parse(
    cleaned.slice(start, end + 1)
  );
  return articles;
}
