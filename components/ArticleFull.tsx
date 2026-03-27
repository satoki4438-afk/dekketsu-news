import type { Article } from "@/lib/firestore";
import { Timestamp } from "firebase-admin/firestore";

const CATEGORY_COLORS: Record<string, string> = {
  経済: "bg-blue-100 text-blue-700 border-blue-200",
  政治: "bg-red-100 text-red-700 border-red-200",
  社会: "bg-green-100 text-green-700 border-green-200",
  国際: "bg-purple-100 text-purple-700 border-purple-200",
  生活: "bg-orange-100 text-orange-700 border-orange-200",
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

export default function ArticleFull({ article }: { article: Article }) {
  const colorClass = CATEGORY_COLORS[article.category] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <article className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${colorClass}`}>
            {article.category}
          </span>
          <span className="text-sm text-gray-400">{formatDate(article.publishedAt)}</span>
        </div>
        <div className="flex items-start gap-4">
          <span className="text-5xl flex-shrink-0">{article.emoji}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Fact */}
      <section className="bg-gray-50 rounded-xl p-5 mb-6">
        <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>📋</span> 3行でわかる事実
        </h2>
        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
          {article.fact}
        </div>
      </section>

      {/* Japan vs World */}
      <section className="mb-6">
        <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🌐</span> 日本 vs 海外の見方
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🇯🇵</span>
              <span className="font-semibold text-red-700">日本メディア</span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-auto">
                {article.japan_tone}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{article.japan_view}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌍</span>
              <span className="font-semibold text-blue-700">海外メディア</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-auto">
                {article.world_tone}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{article.world_view}</p>
          </div>
        </div>
        {article.gap_analysis && (
          <div className="mt-3 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-yellow-700">視点の差：</span> {article.gap_analysis}
            </p>
          </div>
        )}
      </section>

      {/* Impacts */}
      {article.impacts?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>💥</span> ワイらどうなる？
          </h2>
          <div className="space-y-3">
            {article.impacts.map((impact, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <span className="text-2xl flex-shrink-0">{impact.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{impact.title}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{impact.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      {article.actions?.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>💡</span> どう動く？
          </h2>
          <div className="space-y-2">
            {article.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Keywords */}
      {article.related_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {article.related_keywords.map((kw, i) => (
            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              #{kw}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
