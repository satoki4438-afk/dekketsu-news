import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleById, getRelatedArticles, getAdjacentArticles } from "@/lib/firestore";
import ArticleFull from "@/components/ArticleFull";
import ArticleCard from "@/components/ArticleCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ViewTracker from "@/components/ViewTracker";
import FollowButton from "@/components/FollowButton";
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

  const desc = (article.three_points || article.fact || "").replace(/<[^>]*>/g, "").split("\n")[0];
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

  const [related, adjacent] = await Promise.all([
    getRelatedArticles(article.category, article.id, 3).catch(() => []),
    getAdjacentArticles(article.createdAt).catch(() => ({ newer: null, older: null })),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dekketsu-news-sody.vercel.app";
  const articleUrl = `${baseUrl}/article/${article.id}`;
  const shareTitle = article.title.replace(/<[^>]*>/g, "");
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle}\n${articleUrl}`)}&hashtags=でどうなるの`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(articleUrl)}`;

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

          <ViewTracker articleId={article.id} />
          {/* 記事本文 */}
          <ArticleFull article={article} />

          {/* おっかけボタン */}
          <div className="mt-6 flex justify-center">
            <FollowButton articleId={article.id} />
          </div>

          {/* シェアボタン */}
          <div className="mt-4 flex justify-center gap-3">
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-80"
              style={{ background: "#000", color: "#fff", border: "1px solid #333" }}
            >
              𝕏 ポスト
            </a>
            <a
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-80"
              style={{ background: "#06C755", color: "#fff" }}
            >
              LINE
            </a>
          </div>

          {/* 前後ナビ */}
          {(adjacent.newer || adjacent.older) && (
            <div className="mt-10 grid grid-cols-2 gap-3">
              <div>
                {adjacent.newer && (
                  <Link
                    href={`/article/${adjacent.newer.id}`}
                    className="flex flex-col gap-1 border rounded-xl p-4 transition-all hover:border-[rgba(245,200,66,0.3)] hover:bg-[#1e1e1e]"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>← 新しい記事</span>
                    <span className="text-[12px] line-clamp-2" style={{ color: "var(--text)" }}>
                      {adjacent.newer.emoji} {adjacent.newer.title.replace(/<[^>]*>/g, "")}
                    </span>
                  </Link>
                )}
              </div>
              <div>
                {adjacent.older && (
                  <Link
                    href={`/article/${adjacent.older.id}`}
                    className="flex flex-col gap-1 border rounded-xl p-4 transition-all hover:border-[rgba(245,200,66,0.3)] hover:bg-[#1e1e1e] text-right"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>古い記事 →</span>
                    <span className="text-[12px] line-clamp-2" style={{ color: "var(--text)" }}>
                      {adjacent.older.emoji} {adjacent.older.title.replace(/<[^>]*>/g, "")}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}

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
