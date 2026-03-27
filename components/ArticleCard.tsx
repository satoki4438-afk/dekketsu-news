import Link from "next/link";
import type { Article } from "@/lib/firestore";
import { Timestamp } from "firebase-admin/firestore";

const CATEGORY_COLORS: Record<string, string> = {
  経済: "bg-blue-100 text-blue-700",
  政治: "bg-red-100 text-red-700",
  社会: "bg-green-100 text-green-700",
  国際: "bg-purple-100 text-purple-700",
  生活: "bg-orange-100 text-orange-700",
};

function formatDate(ts: Timestamp | { _seconds: number }): string {
  const date =
    ts instanceof Timestamp
      ? ts.toDate()
      : new Date((ts as { _seconds: number })._seconds * 1000);
  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArticleCard({ article }: { article: Article }) {
  const colorClass = CATEGORY_COLORS[article.category] ?? "bg-gray-100 text-gray-700";
  const factFirst = article.fact.split("\n")[0];

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl flex-shrink-0">{article.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                {article.category}
              </span>
              <span className="text-xs text-gray-400">{formatDate(article.publishedAt)}</span>
            </div>
            <h2 className="font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {article.title}
            </h2>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">{factFirst}</p>
        <div className="mt-3 text-xs text-blue-500 font-medium group-hover:underline">
          続きを読む →
        </div>
      </div>
    </Link>
  );
}
