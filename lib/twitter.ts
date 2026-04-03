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

function buildSingleTweetText(article: Article, baseUrl: string): string {
  const title = stripHtml(article.title);
  const subtitle = stripHtml(article.subtitle ?? "");
  const verdict = stripHtml(article.verdict || article.gap_analysis || "");
  const threePoints = stripHtml(article.three_points || article.fact || "");
  const japan = stripHtml(article.japan_view);
  const japanSource = stripHtml(article.japan_source ?? "");
  const world = stripHtml(article.world_view ?? "");
  const worldSource = stripHtml(article.world_source ?? "");
  const winner = (article.winners ?? []).map(stripHtml).join("、");
  const loser = (article.losers ?? []).map(stripHtml).join("、");
  const impacts = (article.impacts ?? []).map((i) => `${i.icon} ${stripHtml(i.title)}：${stripHtml(i.body)}`).join("\n");
  const actions = (article.actions ?? []).map(stripHtml).join("\n→ ");

  const subtitleLine = subtitle ? `${subtitle}\n\n` : "";
  const japanSourceLine = japanSource ? `（${japanSource}）` : "";
  const worldLine = world ? `\n🌍 海外：${world}${worldSource ? `（${worldSource}）` : ""}` : "";
  const winnersLine = winner ? `得✅ ${winner}\n` : "";
  const losersLine = loser ? `損❌ ${loser}\n` : "";
  const impactsLine = impacts ? `${impacts}` : "";
  const actionsLine = actions ? `→ ${actions}` : "";
  const articleUrl = `${baseUrl}/article/${article.id}`;

  const text = `【${title}】\n${subtitleLine}💥 で、どうなるの？\n→ ${verdict}\n\n📋 3行ぐらいでわかること\n${threePoints}\n\n🌐 日本と海外\n🇯🇵 日本：${japan}${japanSourceLine}${worldLine}\n\n🤔 で、どういうこと？\n${impactsLine}\n\n💰 得する・損する\n${winnersLine}${losersLine}\n💡 じゃあ何かしといた方がいいこと\n${actionsLine}\n\n${articleUrl}\n\n#で、どうなるの`;
  return truncate(text, 25000);
}

export async function postBuzzTweet(
  tweetText: string
): Promise<{ success: boolean; tweetId: string | null; error: string | null }> {
  const hasConfig =
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!hasConfig) return { success: false, tweetId: null, error: "Twitter not configured" };

  const client = getTwitterClient();
  try {
    // TODO: 画像アップロードは一時スキップ。テキストのみ投稿で動作確認後に再実装
    const { data } = await client.readWrite.v2.tweet({ text: tweetText });
    return { success: true, tweetId: data.id, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Buzz tweet error:", err);
    return { success: false, tweetId: null, error: message };
  }
}

export async function postTopArticleToTwitter(
  articles: Article[],
  baseUrl: string
): Promise<{ success: boolean; tweetId: string | null; error: string | null; tweetText: string }> {
  if (articles.length === 0) {
    return { success: false, tweetId: null, error: "No articles to post", tweetText: "" };
  }

  const article = selectTopArticle(articles);
  const tweetText = buildSingleTweetText(article, baseUrl);

  const hasTwitterConfig =
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!hasTwitterConfig) {
    return { success: false, tweetId: null, error: "Twitter not configured", tweetText };
  }

  const client = getTwitterClient();
  const rwClient = client.readWrite;

  try {
    const { data } = await rwClient.v2.tweet(tweetText);
    return { success: true, tweetId: data.id, error: null, tweetText };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Twitter post error for article ${article.id}:`, err);
    return { success: false, tweetId: null, error: message, tweetText };
  }
}
