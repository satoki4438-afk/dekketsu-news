import { ImageResponse } from "next/og";
import { getArticleById } from "@/lib/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }
    ).then((r) => r.text());
    const match = css.match(/url\(([^)]+\.woff2)\)/);
    if (!match) return null;
    return fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

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
  const article = await getArticleById(id);

  const title = (article?.title ?? "で、どうなるの？").replace(/<[^>]*>/g, "");
  const emoji = article?.emoji ?? "📰";
  const category = article?.category ?? "";
  const catColor = CATEGORY_COLORS[category] ?? "#888";

  const fontText = `で、どうなるの？${title}${category}`;
  const font = await loadFont(fontText);

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
        }}
      >
        {/* カテゴリ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {category && (
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: catColor,
                background: `${catColor}22`,
                padding: "6px 18px",
                borderRadius: 6,
                border: `1px solid ${catColor}55`,
                fontFamily: font ? "NotoSansJP" : "sans-serif",
              }}
            >
              {category}
            </span>
          )}
        </div>

        {/* タイトル＋絵文字 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
          <span style={{ fontSize: 110, lineHeight: 1 }}>{emoji}</span>
          <div
            style={{
              fontSize: title.length > 20 ? 56 : 72,
              fontWeight: 900,
              color: "#f5c842",
              lineHeight: 1.3,
              fontFamily: font ? "NotoSansJP" : "sans-serif",
              flex: 1,
            }}
          >
            {title}
          </div>
        </div>

        {/* サイト名 */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#555",
            fontFamily: font ? "NotoSansJP" : "sans-serif",
          }}
        >
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
