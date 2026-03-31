import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_COLORS: Record<string, string> = {
  経済: "#4a9eff",
  政治: "#ff6b6b",
  社会: "#6ec96e",
  国際: "#c86ec8",
  生活: "#f5c842",
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 動的importでFirebase Admin初期化をリクエスト時まで遅延
  let title = "で、どうなるの？";
  let emoji = "📰";
  let category = "";

  try {
    const { getArticleById } = await import("@/lib/firestore");
    const article = await getArticleById(id);
    if (article) {
      title = article.title.replace(/<[^>]*>/g, "");
      emoji = article.emoji;
      category = article.category;
    }
  } catch {
    // フォールバックのまま続行
  }

  const catColor = CATEGORY_COLORS[category] ?? "#888";

  // フォント読み込み（失敗時はnull）
  let font: ArrayBuffer | null = null;
  try {
    const data = await readFile(join(process.cwd(), "public/fonts/NotoSansJP-Bold.ttf"));
    font = data.buffer as ArrayBuffer;
  } catch {
    // フォントなしで続行
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: font ? "NotoSansJP" : "sans-serif",
        }}
      >
        <div style={{ display: "flex" }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: catColor,
              background: `${catColor}22`,
              padding: "6px 18px",
              borderRadius: 6,
              border: `1px solid ${catColor}55`,
            }}
          >
            {category || "ニュース"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
          <span style={{ fontSize: 110, lineHeight: "1" }}>{emoji}</span>
          <div
            style={{
              fontSize: title.length > 20 ? 56 : 72,
              fontWeight: 900,
              color: "#f5c842",
              lineHeight: "1.3",
              flex: 1,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ fontSize: 28, fontWeight: 900, color: "#555" }}>
          で、どうなるの？
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "NotoSansJP", data: font, weight: 900, style: "normal" }]
        : [],
    }
  );
}
