import Link from "next/link";
import { getTopArticlesByViews, getTopArticlesByFollowCount } from "@/lib/firestore";

export default async function Sidebar() {
  const [articles, trending] = await Promise.all([
    getTopArticlesByViews(5).catch(() => []),
    getTopArticlesByFollowCount(5).catch(() => []),
  ]);

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
          よく読まれてる
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
          className="text-[11px] font-bold tracking-[2px] mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          👣 TRENDING TOP5
        </h3>
        <div className="flex flex-col">
          {trending.length === 0 ? (
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              まだおっかけがありません
            </p>
          ) : (
            trending.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="flex items-start gap-2.5 py-2 text-[12px] leading-snug transition-colors hover:text-[#f5c842]"
                style={{
                  color: "var(--text)",
                  borderBottom:
                    i < trending.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <span
                  className="text-[16px] font-bold w-5 text-center flex-shrink-0 leading-tight"
                  style={{
                    fontFamily: "var(--font-bebas-neue), sans-serif",
                    color: i === 0 ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="flex-shrink-0">{a.emoji}</span>
                <span className="line-clamp-2">{a.title}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
