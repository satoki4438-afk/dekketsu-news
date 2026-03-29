import { NextRequest, NextResponse } from "next/server";
import { generateArticles, selectTopArticles } from "@/lib/claude";
import { saveArticles, getRecentArticleTitles } from "@/lib/firestore";
import { postArticlesToTwitter } from "@/lib/twitter";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ① 既存記事タイトル取得（直近50件）
    const existingTitles = await getRecentArticleTitles(50);
    const avoidTopics =
      existingTitles.length > 0
        ? `以下はすでに公開済みの記事です：\n${existingTitles.join("\n")}\n【被り判定ルール】\n・同じ出来事・同じ結論の記事は選ばない\n・同じ国や地域でも「別の出来事」ならOK`
        : "";

    // ② 最大7本生成
    console.log("Generating evening articles with Claude...");
    const generatedArticles = await generateArticles(avoidTopics, 7);
    console.log(`Generated ${generatedArticles.length} articles`);

    // ③ 上位5本に絞る
    const selected = await selectTopArticles(generatedArticles, 5);
    console.log(`Selected ${selected.length} articles`);

    // ④ Firestore に保存
    const savedArticles = await saveArticles(selected);
    console.log(`Saved ${savedArticles.length} articles to Firestore`);

    // ⑤ X（Twitter）に自動投稿
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
    }

    return NextResponse.json({
      success: true,
      articlesGenerated: savedArticles.length,
      articleIds: savedArticles.map((a) => a.id),
      twitter: twitterResult,
    });
  } catch (error) {
    console.error("Generate evening error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
