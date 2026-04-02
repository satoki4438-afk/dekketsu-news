import { NextRequest, NextResponse } from "next/server";
import { getLatestArticles } from "@/lib/firestore";
import { generateBuzzTweet } from "@/lib/claude";
import { postBuzzTweet } from "@/lib/twitter";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 直近24時間分（最大10本）を取得
    const articles = await getLatestArticles(10);
    if (articles.length === 0) {
      return NextResponse.json({ success: false, error: "No articles found" });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news-sody.vercel.app").trim();

    // Claudeにバズ文生成を依頼
    const { articleId, text } = await generateBuzzTweet(articles, baseUrl);
    console.log(`Buzz tweet for article ${articleId}:\n${text}`);

    // X に投稿
    const result = await postBuzzTweet(text);

    return NextResponse.json({ success: true, articleId, tweetText: text, twitter: result });
  } catch (error) {
    console.error("Buzz error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
