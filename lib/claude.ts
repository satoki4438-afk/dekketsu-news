import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedArticle {
  title: string;
  category: string;
  emoji: string;
  publishedAt: string;
  fact: string;
  japan_view: string;
  japan_tone: string;
  world_view: string;
  world_tone: string;
  gap_analysis: string;
  impacts: { icon: string; title: string; body: string }[];
  actions: string[];
  related_keywords: string[];
}

const SYSTEM_PROMPT = `あなたは「で、結局どうなの？」というニュース解説メディアの編集者です。
毎朝、日本人の生活に影響するニュースを選び、わかりやすく解説します。

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
    "title": "キャッチーで小学生でもわかるタイトル（30文字以内）",
    "category": "経済 | 政治 | 社会 | 国際 | 生活",
    "emoji": "記事に合う絵文字1つ",
    "publishedAt": "ISO8601形式（今日の日本時間6:00）",
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
      "読者が今日から取れる具体的なアクション1",
      "読者が今日から取れる具体的なアクション2",
      "読者が今日から取れる具体的なアクション3"
    ],
    "related_keywords": ["SEO用キーワード1", "SEO用キーワード2", "SEO用キーワード3"]
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

検索結果を踏まえて、指定のJSON形式で出力してください。`;

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

  // Extract text content from response
  let jsonText = "";
  for (const block of response.content) {
    if (block.type === "text") {
      jsonText = block.text;
      break;
    }
  }

  // Parse JSON - handle cases where Claude wraps in code blocks
  const cleaned = jsonText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find JSON array
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error(`Failed to parse Claude response as JSON array: ${cleaned.slice(0, 200)}`);
  }

  const articles: GeneratedArticle[] = JSON.parse(cleaned.slice(start, end + 1));
  return articles;
}
