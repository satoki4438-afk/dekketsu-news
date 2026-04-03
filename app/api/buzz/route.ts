import { NextRequest, NextResponse } from "next/server";
import { getLatestArticles } from "@/lib/firestore";
import { postTopArticleToTwitter } from "@/lib/twitter";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const articles = await getLatestArticles(10);
    if (articles.length === 0) {
      return NextResponse.json({ success: false, error: "No articles found" });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news-sody.vercel.app").trim();
    const result = await postTopArticleToTwitter(articles, baseUrl);
    console.log(`Buzz tweet:\n${result.tweetText}`);

    return NextResponse.json({ success: result.success, tweetText: result.tweetText, twitter: result });
  } catch (error) {
    console.error("Buzz error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
