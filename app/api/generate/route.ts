import { NextRequest, NextResponse } from "next/server";
import { generateArticles } from "@/lib/claude";
import { saveArticles, getRecentArticleTitles } from "@/lib/firestore";
import { postArticlesToTwitter } from "@/lib/twitter";

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function GET(request: NextRequest) {
  // 1. CRON_SECRET 検証
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. 昨日取り上げたタイトルを取得（重複防止）
    const recentTitles = await getRecentArticleTitles();

    // 3. Claude API で記事生成
    console.log("Generating articles with Claude...");
    const generatedArticles = await generateArticles(recentTitles);
    console.log(`Generated ${generatedArticles.length} articles`);

    // 4. Firestore に保存
    const savedArticles = await saveArticles(generatedArticles);
    console.log(`Saved ${savedArticles.length} articles to Firestore`);

    // 5. X（Twitter）に自動投稿
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news.vercel.app";
    let twitterResult = { success: false, tweetIds: [] as string[], errors: ["Twitter not configured"] };

    const hasTwitterConfig =
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (hasTwitterConfig) {
      console.log("Posting to Twitter...");
      twitterResult = await postArticlesToTwitter(savedArticles, baseUrl);
      console.log(`Twitter result:`, twitterResult);
    }

    return NextResponse.json({
      success: true,
      articlesGenerated: savedArticles.length,
      articleIds: savedArticles.map((a) => a.id),
      twitter: twitterResult,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
