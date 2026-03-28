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

function buildTweetText(article: Article, baseUrl: string): string {
  const url = `${baseUrl}/article/${article.id}`;
  const hashtags = article.related_keywords
    .slice(0, 3)
    .map((k) => `#${k.replace(/\s/g, "")}`)
    .join(" ");

  // Tweet: emoji + title + fact1行 + URL + hashtags
  const factOneLine = (article.three_points || article.fact || "").split("\n")[0].slice(0, 50);
  const tweet = `${article.emoji}【${article.title}】\n\n${factOneLine}...\n\n続きはこちら👇\n${url}\n\n${hashtags} #でけっきょく`;

  // Twitter limit: 280 chars
  if (tweet.length <= 280) return tweet;

  // Fallback: shorter version
  return `${article.emoji}【${article.title}】\n\n${url}\n\n${hashtags} #でけっきょく`;
}

export async function postArticlesToTwitter(
  articles: Article[],
  baseUrl: string
): Promise<{ success: boolean; tweetIds: string[]; errors: string[] }> {
  const client = getTwitterClient();
  const rwClient = client.readWrite;

  const tweetIds: string[] = [];
  const errors: string[] = [];

  for (const article of articles) {
    try {
      const text = buildTweetText(article, baseUrl);
      const { data } = await rwClient.v2.tweet(text);
      tweetIds.push(data.id);

      // Wait 1 second between tweets to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to tweet "${article.title}": ${message}`);
      console.error(`Twitter post error for article ${article.id}:`, err);
    }
  }

  return {
    success: errors.length === 0,
    tweetIds,
    errors,
  };
}
