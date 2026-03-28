import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleById, getRelatedArticles } from "@/lib/firestore";
import ArticleFull from "@/components/ArticleFull";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
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

  const desc = (article.three_points || article.fact || "").split("\n")[0];
  return {
    title: `${article.title} | で、どうなるの？`,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
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

  const related = await getRelatedArticles(article.category, article.id, 3).catch(() => []);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start">
        <div className="min-w-0">
          {/* パンくず */}
          <nav className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link
              href="/"
              className="transition-colors hover:text-[#f0ede8]"
              style={{ color: "var(--text-muted)" }}
            >
              トップ
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "var(--text)" }}>{article.title.replace(/<[^>]*>/g, "")}</span>
          </nav>

          {/* 記事本文 */}
          <ArticleFull article={article} />

          {/* 関連記事 */}
          {related.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <h2
                  className="text-[13px] font-bold tracking-[2px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  📎 つながるニュース
                </h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--border)" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/article/${r.id}`}
                    className="flex items-center gap-3 border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3.5 text-[13px] transition-all hover:border-[rgba(245,200,66,0.3)] hover:bg-[#1e1e1e]"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {r.category}
                    </span>
                    <span className="line-clamp-1">{r.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div
            className="mt-10 pt-5 border-t text-[11px] text-center leading-relaxed"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            このサイトは公開情報をもとにAIが解説を生成しています。
            <br />
            投資判断等は自己責任でお願いします。
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[#f0ede8]"
              style={{ color: "var(--text-muted)" }}
            >
              ← トップに戻る
            </Link>
          </div>
        </div>
        <Sidebar />
        </div>
      </main>
    </>
  );
}
