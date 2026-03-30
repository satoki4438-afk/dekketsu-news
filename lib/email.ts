// ============================================================
// Resend メール送信ライブラリ
//
// 【セットアップ手順】
// 1. https://resend.com にアクセスして無料アカウント登録
// 2. ダッシュボード → API Keys → 「Create API Key」でキーを生成
// 3. Vercel のプロジェクト設定 → Environment Variables に以下を追加:
//    RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxx
//    RESEND_FROM    = onboarding@resend.dev  （無料枠のデフォルト送信元）
//    ※独自ドメインで送りたい場合は Resend でドメイン認証後に変更
// ============================================================

import { Resend } from "resend";

export async function sendTweetDraftEmail(tweetText: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("RESEND_API_KEY not set — skipping email");
    return;
  }

  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const to = "tas.studio2026@gmail.com";

  const resend = new Resend(apiKey);

  const body = `今日の投稿文はこちらです👇
コピペしてXに投稿してください！

━━━━━━━━━━━━━━
${tweetText}
━━━━━━━━━━━━━━`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "【やわらかニュース】今日のX投稿文",
    text: body,
  });

  if (error) {
    console.error("Resend email error:", error);
  } else {
    console.log("Email sent successfully");
  }
}
