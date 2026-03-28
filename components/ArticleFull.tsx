import type { Article } from "@/lib/firestore";
import { Timestamp } from "firebase-admin/firestore";

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  経済: {
    bg: "rgba(74,158,255,0.12)",
    text: "#4a9eff",
    border: "rgba(74,158,255,0.3)",
  },
  政治: {
    bg: "rgba(255,107,107,0.12)",
    text: "#ff6b6b",
    border: "rgba(255,107,107,0.3)",
  },
  社会: {
    bg: "rgba(100,200,100,0.12)",
    text: "#6ec96e",
    border: "rgba(100,200,100,0.3)",
  },
  国際: {
    bg: "rgba(200,100,200,0.12)",
    text: "#c86ec8",
    border: "rgba(200,100,200,0.3)",
  },
  生活: {
    bg: "rgba(245,200,66,0.12)",
    text: "#f5c842",
    border: "rgba(245,200,66,0.3)",
  },
};

function formatDate(ts: Timestamp | { _seconds: number }): string {
  const date =
    ts instanceof Timestamp
      ? ts.toDate()
      : new Date((ts as { _seconds: number })._seconds * 1000);
  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2
        className="text-[13px] font-bold tracking-[2px] whitespace-nowrap"
        style={{ color: "var(--text-muted)" }}
      >
        {children}
      </h2>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

export default function ArticleFull({ article }: { article: Article }) {
  const color = CATEGORY_COLORS[article.category] ?? {
    bg: "rgba(255,255,255,0.06)",
    text: "#888",
    border: "rgba(255,255,255,0.2)",
  };
  const threePoints = article.three_points || article.fact || "";

  return (
    <article>
      {/* ヒーロー */}
      <div
        className="mb-6 pb-6 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[4px] tracking-wider border"
            style={{
              background: color.bg,
              color: color.text,
              borderColor: color.border,
            }}
          >
            <span className="animate-pulse text-[8px]">●</span>
            {article.category}
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {formatDate(article.publishedAt)}
          </span>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl flex-shrink-0">{article.emoji}</span>
          <h1
            className="text-2xl sm:text-3xl font-black leading-tight tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {article.title}
          </h1>
        </div>

        {/* 元記事出典 */}
        <div
          className="flex items-center gap-3 text-[12px] flex-wrap"
          style={{ color: "var(--text-muted)" }}
        >
          {article.source_name && (
            <span className="flex items-center gap-1">
              📰 出典：
              {article.source_url ? (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {article.source_name}
                </a>
              ) : (
                article.source_name
              )}
            </span>
          )}
          <span>📖 読了2分</span>
        </div>
      </div>

      {/* 📋 3行でわかること */}
      <div
        className="rounded-lg p-5 mb-7 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          borderLeft: "4px solid var(--accent)",
        }}
      >
        <div
          className="text-[11px] font-bold tracking-[2px] mb-3"
          style={{ color: "var(--accent)" }}
        >
          📋 3行でわかること
        </div>
        <div
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: "var(--text)" }}
        >
          {threePoints}
        </div>
      </div>

      {/* 🇯🇵 日本 / 🌍 海外 */}
      <div className="mb-7">
        <SectionHeading>🌐 日本と海外、こう違う</SectionHeading>
        <div
          className={`grid gap-3 ${article.world_view ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
        >
          {/* 日本 */}
          <div
            className="border rounded-xl p-5 relative overflow-hidden"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "var(--jp-color)" }}
            />
            <span className="text-xl block mb-1.5">🇯🇵</span>
            <div
              className="text-[10px] font-bold tracking-wider mb-2.5"
              style={{ color: "var(--jp-color)" }}
            >
              日本のニュースはこう言ってる
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#ccc" }}>
              {article.japan_view}
            </p>
            {article.japan_source && (
              <div
                className="mt-2 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                出典：{article.japan_source}
              </div>
            )}
            {article.japan_tone && (
              <span
                className="inline-block mt-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: "rgba(74,158,255,0.15)",
                  color: "var(--jp-color)",
                }}
              >
                {article.japan_tone}
              </span>
            )}
          </div>

          {/* 海外（なければ省く） */}
          {article.world_view && (
            <div
              className="border rounded-xl p-5 relative overflow-hidden"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "var(--world-color)" }}
              />
              <span className="text-xl block mb-1.5">🌍</span>
              <div
                className="text-[10px] font-bold tracking-wider mb-2.5"
                style={{ color: "var(--world-color)" }}
              >
                海外のニュースはこう言ってる
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "#ccc" }}
              >
                {article.world_view}
              </p>
              {article.world_source && (
                <div
                  className="mt-2 text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  出典：{article.world_source}
                </div>
              )}
              {article.world_tone && (
                <span
                  className="inline-block mt-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: "rgba(255,107,107,0.15)",
                    color: "var(--world-color)",
                  }}
                >
                  {article.world_tone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ⚖️ ぶっちゃけどっちが正しい？ */}
        {(article.verdict || article.gap_analysis) && (
          <div
            className="mt-3 border rounded-xl p-4 text-[13px] leading-relaxed"
            style={{
              background: "var(--surface2)",
              borderColor: "var(--border)",
              color: "#bbb",
            }}
          >
            <span
              className="font-bold block mb-1"
              style={{ color: "var(--text)" }}
            >
              ⚖️ ぶっちゃけどっちが正しい？
            </span>
            {article.verdict || article.gap_analysis}
          </div>
        )}
      </div>

      {/* 💰 得する・損する */}
      {((article.winners?.length ?? 0) > 0 ||
        (article.losers?.length ?? 0) > 0) && (
        <div className="mb-7">
          <SectionHeading>💰 得する・損する</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(article.winners?.length ?? 0) > 0 && (
              <div
                className="border rounded-xl p-4"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="text-[11px] font-bold tracking-wider mb-3"
                  style={{ color: "#4caf80" }}
                >
                  得する人
                </div>
                <div className="flex flex-col gap-2">
                  {article.winners!.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[13px]"
                    >
                      <span
                        className="font-bold flex-shrink-0"
                        style={{ color: "#4caf80" }}
                      >
                        ↑
                      </span>
                      <span style={{ color: "var(--text)" }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(article.losers?.length ?? 0) > 0 && (
              <div
                className="border rounded-xl p-4"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="text-[11px] font-bold tracking-wider mb-3"
                  style={{ color: "var(--accent2)" }}
                >
                  損する人
                </div>
                <div className="flex flex-col gap-2">
                  {article.losers!.map((l, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[13px]"
                    >
                      <span
                        className="font-bold flex-shrink-0"
                        style={{ color: "var(--accent2)" }}
                      >
                        ↓
                      </span>
                      <span style={{ color: "var(--text)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💥 で、うちはどうなるの？ */}
      {article.impacts?.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-black" style={{ color: "var(--text)" }}>
              💥 で、うちはどうなるの？
            </h2>
            <span
              className="text-white text-[11px] px-2 py-0.5 rounded-[4px] font-bold"
              style={{ background: "var(--accent2)" }}
            >
              生活直撃
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {article.impacts.map((impact, i) => (
              <div
                key={i}
                className="border rounded-lg px-4 py-3.5 flex items-start gap-3"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="text-[18px] flex-shrink-0 mt-0.5">
                  {impact.icon}
                </span>
                <div>
                  <div
                    className="font-bold text-[13px] mb-0.5"
                    style={{ color: "var(--text)" }}
                  >
                    {impact.title}
                  </div>
                  <div
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {impact.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💡 じゃあ何かしといた方がいいこと */}
      {article.actions?.length > 0 && (
        <div className="mb-7">
          <div
            className="rounded-xl p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(245,200,66,0.08), rgba(232,82,58,0.05))",
              border: "1px solid rgba(245,200,66,0.2)",
            }}
          >
            <h3
              className="text-[13px] font-bold tracking-[2px] mb-3"
              style={{ color: "var(--accent)" }}
            >
              💡 じゃあ何かしといた方がいいこと
            </h3>
            <ul className="flex flex-col gap-2">
              {article.actions.map((action, i) => (
                <li
                  key={i}
                  className="text-[14px] flex gap-2 items-start leading-relaxed"
                >
                  <span
                    className="font-bold flex-shrink-0"
                    style={{ color: "var(--accent)" }}
                  >
                    →
                  </span>
                  <span style={{ color: "var(--text)" }}>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* キーワード */}
      {article.related_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {article.related_keywords.map((kw, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-1 rounded-full border"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
