import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getArticleTitle(id: string): Promise<{ title: string; emoji: string } | null> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) return null;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articles/${id}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const fields = data.fields;
    if (!fields) return null;
    const title = fields.title?.stringValue ?? "";
    const emoji = fields.emoji?.stringValue ?? "📰";
    return { title, emoji };
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleTitle(id);

  const title = article
    ? article.title.replace(/<[^>]*>/g, "").slice(0, 50)
    : "で、どうなるの？";
  const emoji = article?.emoji ?? "📰";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          gap: "24px",
        }}
      >
        {/* サイトロゴ */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(245,200,66,0.6)",
            letterSpacing: "0.2em",
            display: "flex",
          }}
        >
          で、どうなるの？
        </div>

        {/* 絵文字 */}
        <div style={{ fontSize: 80, display: "flex" }}>{emoji}</div>

        {/* タイトル */}
        <div
          style={{
            fontSize: title.length > 30 ? 36 : 48,
            fontWeight: 900,
            color: "#f0ede8",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: "960px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {title}
        </div>

        {/* アクセントライン */}
        <div
          style={{
            width: "80px",
            height: "4px",
            background: "#f5c842",
            borderRadius: "2px",
            display: "flex",
          }}
        />
      </div>
    ),
    size
  );
}
