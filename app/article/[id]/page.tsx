import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleById, getRelatedArticles } from "@/lib/firestore";
import ArticleFull from "@/components/ArticleFull";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: "記事が見つかりません" };

  return {
    title: `${article.title} | で、結局どうなの？`,
    description: article.fact.split("\n")[0],
    openGraph: {
      title: article.title,
      description: article.fact.split("\n")[0],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const related = await getRelatedArticles(article.category, article.id, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              トップ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{article.title}</span>
          </nav>

          {/* Article */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
            <ArticleFull article={article} />
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span>📌</span> 関連記事（{article.category}）
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <ArticleCard key={r.id} article={r} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
