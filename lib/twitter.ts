import { TwitterApi } from "twitter-api-v2";
import type { Article } from "./firestore";

function getTwitterClient() {
  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error("Twitter API credentials are not set");
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

function stripHtml(s: string): string {
  return s?.replace(/<[^>]*>/g, "") ?? "";
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/** follow_count → view_count の順で最もスコアが高い記事を1本選ぶ */
function selectTopArticle(articles: Article[]): Article {
  return articles.reduce((best, curr) => {
    const bestScore = (best.follow_count ?? 0) * 10 + (best.view_count ?? 0);
    const currScore = (curr.follow_count ?? 0) * 10 + (curr.view_count ?? 0);
    return currScore > bestScore ? curr : best;
  });
}

/** 140文字以内のX投稿文を生成 */
function buildSingleTweetText(article: Article, baseUrl: string): string {
  const title = truncate(stripHtml(article.title), 20);
  const japan = truncate(stripHtml(article.japan_view), 16);
  const worldRaw = stripHtml(article.world_view ?? "");
  const verdict = truncate(stripHtml(article.verdict || article.gap_analysis || ""), 22);

  const worldLine = worldRaw ? `\n🌍 海外：${truncate(worldRaw, 16)}` : "";

  return `【${title}】\n\n🇯🇵 日本：${japan}${worldLine}\n\nで、どうなるの？\n→ ${verdict}\n\n今日のやわらかニュース👇\n${baseUrl}\n\n#やわらかニュース`;
}

export async function postTopArticleToTwitter(
  articles: Article[],
  baseUrl: string
): Promise<{ success: boolean; tweetId: string | null; error: string | null }> {
  if (articles.length === 0) {
    return { success: false, tweetId: null, error: "No articles to post" };
  }

  const client = getTwitterClient();
  const rwClient = client.readWrite;
  const article = selectTopArticle(articles);

  try {
    const text = buildSingleTweetText(article, baseUrl);
    const { data } = await rwClient.v2.tweet(text);
    return { success: true, tweetId: data.id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Twitter post error for article ${article.id}:`, err);
    return { success: false, tweetId: null, error: message };
  }
}
