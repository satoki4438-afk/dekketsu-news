import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** JSON文字列値内の制御文字だけエスケープするstate-machine */
function repairJsonStrings(json: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    const code = ch.charCodeAt(0);

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      result += ch;
      inString = !inString;
      continue;
    }

    if (inString && code < 0x20) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
      if (ch === "\b") { result += "\\b"; continue; }
      if (ch === "\f") { result += "\\f"; continue; }
      // その他の制御文字はUnicodeエスケープに変換
      result += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    result += ch;
  }

  return result;
}

/** JSON配列文字列から個別オブジェクトを安全に抽出 */
function parseJsonArraySafe(json: string): GeneratedArticle[] {
  // まず全体をパースを試みる
  try {
    return JSON.parse(json) as GeneratedArticle[];
  } catch {
    // 失敗した場合は個別オブジェクトを抽出して1つずつパース
    const results: GeneratedArticle[] = [];
    let depth = 0;
    let start = -1;

    for (let i = 0; i < json.length; i++) {
      const ch = json[i];
      if (ch === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          const chunk = json.slice(start, i + 1);
          try {
            const obj = JSON.parse(repairJsonStrings(chunk)) as GeneratedArticle;
            results.push(obj);
          } catch (e) {
            console.warn(`Skipped malformed article object: ${e}`);
          }
          start = -1;
        }
      }
    }

    if (results.length === 0) {
      throw new Error("No valid articles could be parsed from Claude response");
    }
    console.warn(`Partial parse: recovered ${results.length} articles after full-parse failure`);
    return results;
  }
}

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

const SYSTEM_PROMPT = `あなたは「やわらかニュース」の記事ライターです。

## キャラクター設定
難しいことを知ってる友達が、LINEで説明してくれる感じ。上から目線ゼロ。一緒に考える感じで書く。

## 文体ルール
- 「〜します」「〜あります」は使わない
- 「かも」「らしい」「っぽい」「わりと」「ちょっと」を積極的に使う
- 箇条書きにしない・会話調で書く
- 読者を「あなた」と呼んでいい
- 断言しすぎない
- 専門用語は必ず言い換える（例：「量的緩和」→「国が大量にお金を刷ること」）
- 因果と相関を混同しない（「〜と同時期に〜が起きたっぽい」と正直に書く）
- 数字には必ず出典を明記する（例：3.2%上昇（出典：総務省、2026年3月））
- 偏らない（日本と海外の論調を両方伝える）

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
【重要】出力するすべてのテキストフィールドに <cite>、<cite index="...">、その他いかなるHTMLタグも絶対に含めないでください。web_searchの引用は自動的にciteタグに変換されることがありますが、それをJSONのフィールド値に含めないでください。引用元は必ず「（出典：〇〇）」のようにプレーンテキストで書いてください。

[
  {
    "title": "キャッチタイトル（友達へのLINE感覚・難しい言葉ゼロ・20文字以内。「また」「え？」「実は」「どういうこと？」系の言葉を使う。固有名詞（人名・法律名）を避ける。答えは書かず続きを読ませる。例：「また利上げ？ローンある人は」）",
    "subtitle": "ファクトタイトル（何が起きたか一文で・30文字以内・ファクトベース。従来のtitleをここに置く感覚。例：「日銀、年内2回の追加利上げ濃厚に」）",
    "category": "経済 | 政治 | 社会 | 国際 | 生活",
    "emoji": "記事に合う絵文字1つ",
    "publishedAt": "ISO8601形式（今日の日本時間6:00）",

    "source_url": "元記事のURL（web_searchで取得したもの）",
    "source_name": "元記事の出典名（例：NHK、日経新聞、Reuters）",

    "three_points": "3行ぐらい。「何が起きたか」の事実のみ書く。結論・影響は書かない（それは後のフィールドに取っておく）。数字はそのまま使い出典を明記（例：3.2%上昇（出典：総務省、2026年3月））。専門用語は言い換える。<cite>タグ禁止",

    "japan_view": "日本メディアの論調（100文字）。専門用語は言い換える",
    "japan_source": "日本メディアの出典（例：NHK、朝日新聞）",
    "japan_tone": "論調を一言で（例：政府より、楽観的、煽り気味）",

    "world_view": "海外メディアの論調（100文字）。海外報道がなければ空文字列を入れる",
    "world_source": "海外メディアの出典（例：Reuters、BBC）。なければ空文字列",
    "world_tone": "論調を一言で。なければ空文字列",

    "verdict": "🤔 で、どういうこと？（150文字）。対立構造にしない。「要はこういうことよ」って友達に説明する感じで。難しい言葉は即言い換える。因果関係は「〜のせいで→〜になる」でつなぐ。断言しすぎず「〜っぽい」「〜かも」で余白を残す",

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
  avoidTopics: string = "",
  maxArticles: number = 15,
  priorityKeywords: string[] = []
): Promise<GeneratedArticle[]> {
  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prioritySection =
    priorityKeywords.length > 0
      ? `\n\n【おっかけ優先トピック】\n以下のトピックに関連する続報・関連ニュースを優先的に選んでください：\n${priorityKeywords.map((k) => `・${k}`).join("\n")}`
      : "";

  const userMessage = `今日（${today}）の日本および世界のニュースをweb_searchで検索し、選定ルールに従って最大${maxArticles}本のニュースを選んで解説してください。${avoidTopics ? `\n\n${avoidTopics}` : ""}${prioritySection}

web_searchで以下のクエリを検索してください：
1. "日本 経済ニュース ${today}"
2. "Japan news today site:reuters.com OR site:bloomberg.com OR site:bbc.com"
3. "日本 政策 物価 給与 ${today}"

検索結果を踏まえて、指定のJSON形式で出力してください。
文体ルールに従い、友達へのLINE感覚で書いてください。専門用語は必ず言い換え、数字には必ず出典を明記してください。`;

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

  // JSON配列を含むテキストブロックを抽出（最後のものを優先）
  let jsonText = "";
  for (const block of response.content) {
    if (block.type === "text" && block.text.includes("[")) {
      jsonText = block.text;
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

  // state-machine でサニタイズ → 個別フォールバック付きパース
  const sanitized = repairJsonStrings(cleaned.slice(start, end + 1));
  const articles = parseJsonArraySafe(sanitized);
  return articles;
}

export async function generateBuzzTweet(
  articles: { id: string; title: string; subtitle?: string; verdict?: string; gap_analysis?: string; emoji: string; category: string }[],
  baseUrl: string
): Promise<{ articleId: string; text: string }> {
  const list = articles
    .map((a, i) => `[${i}] ${a.emoji} ${a.title.replace(/<[^>]*>/g, "")} — ${(a.verdict || a.gap_analysis || "").replace(/<[^>]*>/g, "").slice(0, 60)}`)
    .join("\n");

  const prompt = `以下の記事リストの中から、Xで最もバズりそうな1本を選び、フック強めの投稿文を書いてください。

【記事リスト】
${list}

【投稿文のルール】
- 1行目：「え、これマジ？」「知らなかった」「ちょっと待って」系のフック（絵文字あり）
- 2〜3行：「実は〜」「多くの人が気づいてないけど〜」系で続きを読ませる煽り
- 最後：「👉 詳しくはこちら」の1行（URLは後で付ける）
- 合計150文字以内
- 硬い言葉ゼロ・友達LINEの感覚で
- #でどうなるの を末尾につける

以下のJSON形式で返してください。説明文不要。
{"index": 選んだ記事のindex番号, "text": "投稿文"}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content.find((b) => b.type === "text")?.text.trim() ?? "";
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    const article = articles[0];
    return {
      articleId: article.id,
      text: `${article.emoji} ${article.title.replace(/<[^>]*>/g, "")}\n👉 詳しくはこちら\n${baseUrl}/article/${article.id}\n#でどうなるの`,
    };
  }

  const parsed = JSON.parse(raw.slice(start, end + 1));
  const idx = Number(parsed.index);
  const article = articles[Math.max(0, Math.min(idx, articles.length - 1))];
  const tweetText = `${parsed.text}\n${baseUrl}/article/${article.id}`;
  return { articleId: article.id, text: tweetText };
}

export async function selectTopArticles(
  articles: GeneratedArticle[],
  topN: number
): Promise<GeneratedArticle[]> {
  if (articles.length <= topN) return articles;

  const prompt = `以下は生成された${articles.length}本の記事候補です。
以下の基準で上位${topN}本を選んでください。

【選定基準】
・経済・政治の記事を全体の6割以上にする
・同じ出来事・同じ結論の記事は1本に絞る
・生活への影響が大きいものを優先
・読者が「で、どうなるの？」と思うものを優先

選んだ${topN}本のindexを配列で返してください。
例：[0,1,3,5,6,7,9,11,12,14]
JSONのみ返すこと。説明文不要。

記事一覧：
${articles.map((a, i) => `[${i}] ${a.subtitle}`).join("\n")}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content.find((b) => b.type === "text")?.text.trim() ?? "";
  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");
  if (arrStart === -1 || arrEnd === -1) return articles.slice(0, topN);

  const indices: number[] = JSON.parse(text.slice(arrStart, arrEnd + 1));
  return indices
    .filter((i) => i >= 0 && i < articles.length)
    .slice(0, topN)
    .map((i) => articles[i]);
}
