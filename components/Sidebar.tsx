import Link from "next/link";
import { getLatestArticles } from "@/lib/firestore";

export default async function Sidebar() {
  const articles = await getLatestArticles(10).catch(() => []);

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-[110px]">
      {/* 今日の記事一覧 */}
      <div
        className="border rounded-xl p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3
          className="text-[11px] font-bold tracking-[2px] mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          TODAY&apos;S NEWS
        </h3>
        <div className="flex flex-col">
          {articles.length === 0 ? (
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              記事はまだありません
            </p>
          ) : (
            articles.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="flex items-start gap-2 py-2 text-[12px] leading-snug transition-colors hover:text-[#f5c842]"
                style={{
                  color: "var(--text)",
                  borderBottom:
                    i < articles.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <span className="flex-shrink-0">{a.emoji}</span>
                <span className="line-clamp-2">{a.title}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* おっかけランキング TOP5 */}
      <div
        className="border rounded-xl p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3
          className="text-[11px] font-bold tracking-[2px] mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          TRENDING TOP5
        </h3>
        <p className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>
          ※ランキング機能は近日公開
        </p>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex items-center gap-3 py-2 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="text-[20px] font-bold w-6 text-center flex-shrink-0 leading-none"
                style={{
                  fontFamily: "var(--font-bebas-neue), sans-serif",
                  color: n === 1 ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {n}
              </span>
              <div
                className="h-2.5 rounded-full flex-1"
                style={{
                  background: "var(--surface2)",
                  opacity: 1 - n * 0.15,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
