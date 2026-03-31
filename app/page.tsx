import { getArticlesCursor, getArticlesByMonthCursor } from "@/lib/firestore";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const revalidate = 3600;

const CATEGORIES = ["全部", "経済", "政治", "社会", "国際", "生活"] as const;
type Category = (typeof CATEGORIES)[number];

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const categoryParam = typeof params.category === "string" ? params.category : "全部";
  const activeCategory: Category = (CATEGORIES as readonly string[]).includes(categoryParam)
    ? (categoryParam as Category)
    : "全部";

  const activeMonth =
    typeof params.month === "string" && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : null;

  // afterMs: カーソル（前ページ最後の createdAt ミリ秒）
  const afterParam = typeof params.after === "string" ? parseInt(params.after, 10) : undefined;
  const afterMs = afterParam && Number.isFinite(afterParam) ? afterParam : undefined;

  const category = activeCategory !== "全部" ? activeCategory : undefined;

  const { articles, hasMore, lastMs } = await (
    activeMonth
      ? getArticlesByMonthCursor(PAGE_SIZE, activeMonth, afterMs, category)
      : getArticlesCursor(PAGE_SIZE, afterMs, category)
  ).catch(() => ({ articles: [], hasMore: false, lastMs: null }));

  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function nextHref() {
    const q = new URLSearchParams();
    if (activeCategory !== "全部") q.set("category", activeCategory);
    if (activeMonth) q.set("month", activeMonth);
    if (lastMs != null) q.set("after", String(lastMs));
    return `/?${q.toString()}`;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 見出し・カテゴリフィルター */}
          <div className="mb-6">
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {activeMonth ? `${activeMonth.replace("-", "/")} のニュース` : "今日のニュース"}
              {!activeMonth && (
                <span className="text-sm font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                  {today}
                </span>
              )}
            </h1>
            {activeMonth ? (
              <a href="/" className="text-sm mt-1 hover:underline" style={{ color: "var(--accent)" }}>
                ← 最新記事に戻る
              </a>
            ) : (
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                毎朝・夕方にAIが自動収集・解説 — 生活への影響までまるわかり
              </p>
            )}
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={cat === "全部" ? (activeMonth ? `/?month=${activeMonth}` : "/") : (activeMonth ? `/?category=${cat}&month=${activeMonth}` : `/?category=${cat}`)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border"
                style={
                  activeCategory === cat
                    ? { background: "var(--accent)", color: "#0d0d0d", borderColor: "var(--accent)", fontWeight: 700 }
                    : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
                }
              >
                {cat}
              </a>
            ))}
          </div>

          {/* 記事グリッド ＋ サイドバー */}
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start">
            <div>
              {articles.length === 0 ? (
                <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-lg font-medium">まだ記事がありません</p>
                  <p className="text-sm mt-2">毎朝6時に自動更新されます</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  {/* ページネーション */}
                  <div className="flex items-center justify-center gap-4 mt-10">
                    {afterMs != null ? (
                      <a
                        href={(() => {
                          const q = new URLSearchParams();
                          if (activeCategory !== "全部") q.set("category", activeCategory);
                          if (activeMonth) q.set("month", activeMonth);
                          const qs = q.toString();
                          return qs ? `/?${qs}` : "/";
                        })()}
                        className="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
                        style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                      >
                        ← 最初に戻る
                      </a>
                    ) : null}

                    {hasMore && lastMs != null ? (
                      <a
                        href={nextHref()}
                        className="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
                        style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }}
                      >
                        もっと見る →
                      </a>
                    ) : null}
                  </div>
                </>
              )}
            </div>
            <Sidebar />
          </div>
        </div>
      </main>
    </>
  );
}
