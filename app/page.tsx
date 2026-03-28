import { getLatestArticles, getArticlesByCategory } from "@/lib/firestore";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";

export const revalidate = 3600;

const CATEGORIES = ["全部", "経済", "政治", "社会", "国際", "生活"] as const;
type Category = (typeof CATEGORIES)[number];

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

  const articles =
    activeCategory === "全部"
      ? await getLatestArticles(12)
      : await getArticlesByCategory(activeCategory, 12);

  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              今日のニュース
              <span
                className="text-sm font-normal ml-2"
                style={{ color: "var(--text-muted)" }}
              >
                {today}
              </span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              毎朝6時にAIが自動収集・解説 — 生活への影響までまるわかり
            </p>
          </div>

          {/* カテゴリフィルター */}
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

          {/* 記事グリッド */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
