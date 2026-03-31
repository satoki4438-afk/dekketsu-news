import { searchArticles } from "@/lib/firestore";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const articles = query.length > 0 ? await searchArticles(query).catch(() => []) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 検索フォーム */}
          <form action="/search" method="GET" className="mb-8">
            <div className="flex gap-2 max-w-xl">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="キーワードを入力..."
                autoFocus
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-[var(--accent)]"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                style={{ background: "var(--accent)", color: "#0d0d0d" }}
              >
                検索
              </button>
            </div>
          </form>

          {/* 結果ヘッダー */}
          {query && (
            <div className="mb-6">
              <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                「{query}」の検索結果
                <span className="text-sm font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                  {articles.length}件
                </span>
              </h1>
            </div>
          )}

          {/* 結果一覧 */}
          {query.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              キーワードを入力して検索してください。
            </p>
          ) : articles.length === 0 ? (
            <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">記事が見つかりませんでした</p>
              <p className="text-sm mt-2">別のキーワードで試してみてください</p>
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
