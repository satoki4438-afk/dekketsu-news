import { NextRequest, NextResponse } from "next/server";
import { generateArticles, selectTopArticles } from "@/lib/claude";
import { saveArticles, getRecentArticleTitles, getTopFollowedKeywords } from "@/lib/firestore";
import { postTopArticleToTwitter } from "@/lib/twitter";

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function GET(request: NextRequest) {
  // 1. CRON_SECRET 検証
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ① 既存記事タイトル取得（直近50件）＆おっかけ上位キーワード取得
    const [existingTitles, priorityKeywords] = await Promise.all([
      getRecentArticleTitles(50),
      getTopFollowedKeywords(3),
    ]);
    const avoidTopics =
      existingTitles.length > 0
        ? `以下はすでに公開済みの記事です：\n${existingTitles.join("\n")}\n【被り判定ルール】\n・同じ出来事・同じ結論の記事は選ばない\n・同じ国や地域でも「別の出来事」ならOK`
        : "";

    // ② 最大15本生成
    console.log("Generating articles with Claude...");
    if (priorityKeywords.length > 0) {
      console.log(`Priority keywords from follows: ${priorityKeywords.join(", ")}`);
    }
    const generatedArticles = await generateArticles(avoidTopics, 15, priorityKeywords);
    console.log(`Generated ${generatedArticles.length} articles`);

    // ③ 上位10本に絞る
    const selected = await selectTopArticles(generatedArticles, 10);
    console.log(`Selected ${selected.length} articles`);

    // ④ Firestore に保存
    const savedArticles = await saveArticles(selected);
    console.log(`Saved ${savedArticles.length} articles to Firestore`);

    // 5. X（Twitter）に自動投稿（上位1本のみ）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news-sody.vercel.app";
    let twitterResult: { success: boolean; tweetId: string | null; error: string | null } = {
      success: false,
      tweetId: null,
      error: "Twitter not configured",
    };

    const hasTwitterConfig =
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (hasTwitterConfig) {
      console.log("Posting to Twitter...");
      twitterResult = await postTopArticleToTwitter(savedArticles, baseUrl);
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
