import { getAllArticles, getAllArticlesByCategory } from "@/lib/firestore";
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
  const categoryParam =
    typeof params.category === "string" ? params.category : "全部";
  const activeCategory: Category = (
    CATEGORIES as readonly string[]
  ).includes(categoryParam)
    ? (categoryParam as Category)
    : "全部";

  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const activeMonth = typeof params.month === "string" && /^\d{4}-\d{2}$/.test(params.month)
    ? params.month
    : null;

  const fetched =
    activeCategory === "全部"
      ? await getAllArticles().catch(() => [])
      : await getAllArticlesByCategory(activeCategory).catch(() => []);

  const JST_OFFSET = 9 * 60 * 60 * 1000;
  const allArticles = activeMonth
    ? fetched.filter((a) => {
        const ts = a.createdAt;
        const jstDate = new Date(ts.toDate().getTime() + JST_OFFSET);
        const key = `${jstDate.getUTCFullYear()}-${String(jstDate.getUTCMonth() + 1).padStart(2, "0")}`;
        return key === activeMonth;
      })
    : fetched;

  const totalCount = allArticles.length;
  const offset = (currentPage - 1) * PAGE_SIZE;
  const articles = allArticles.slice(offset, offset + PAGE_SIZE);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function pageHref(page: number) {
    const q = new URLSearchParams();
    if (activeCategory !== "全部") q.set("category", activeCategory);
    if (activeMonth) q.set("month", activeMonth);
    if (page > 1) q.set("page", String(page));
    const qs = q.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 見出し・カテゴリフィルター（フル幅） */}
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
                href={cat === "全部" ? "/" : `/?category=${cat}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border"
                style={
                  activeCategory === cat
                    ? {
                        background: "var(--accent)",
                        color: "#0d0d0d",
                        borderColor: "var(--accent)",
                        fontWeight: 700,
                      }
                    : {
                        background: "var(--surface)",
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                      }
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
                <div
                  className="text-center py-20"
                  style={{ color: "var(--text-muted)" }}
                >
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
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                      {currentPage > 1 ? (
                        <a
                          href={pageHref(currentPage - 1)}
                          className="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
                          style={{
                            background: "var(--surface)",
                            color: "var(--text)",
                            borderColor: "var(--border)",
                          }}
                        >
                          ← 前のページ
                        </a>
                      ) : (
                        <span className="px-5 py-2 rounded-full text-sm font-medium border opacity-30 cursor-default"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                          ← 前のページ
                        </span>
                      )}

                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {currentPage} / {totalPages}
                      </span>

                      {currentPage < totalPages ? (
                        <a
                          href={pageHref(currentPage + 1)}
                          className="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
                          style={{
                            background: "var(--surface)",
                            color: "var(--text)",
                            borderColor: "var(--border)",
                          }}
                        >
                          次のページ →
                        </a>
                      ) : (
                        <span className="px-5 py-2 rounded-full text-sm font-medium border opacity-30 cursor-default"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                          次のページ →
                        </span>
                      )}
                    </div>
                  )}
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
