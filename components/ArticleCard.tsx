import Link from "next/link";
import type { Article } from "@/lib/firestore";
import { Timestamp } from "firebase-admin/firestore";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  経済: { bg: "rgba(74,158,255,0.12)", text: "#4a9eff" },
  政治: { bg: "rgba(255,107,107,0.12)", text: "#ff6b6b" },
  社会: { bg: "rgba(100,200,100,0.12)", text: "#6ec96e" },
  国際: { bg: "rgba(200,100,200,0.12)", text: "#c86ec8" },
  生活: { bg: "rgba(245,200,66,0.12)", text: "#f5c842" },
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
  const color = CATEGORY_COLORS[article.category] ?? {
    bg: "rgba(255,255,255,0.06)",
    text: "#888",
  };
  const summary = (article.three_points || article.fact || "")
    .replace(/<[^>]*>/g, "")
    .split("\n")[0];

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div
        className="rounded-xl p-5 transition-all duration-200 h-full flex flex-col border border-[rgba(255,255,255,0.08)] bg-[#161616] hover:border-[rgba(245,200,66,0.3)] hover:bg-[#1e1e1e]"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl flex-shrink-0">{article.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-wider"
                style={{ background: color.bg, color: color.text }}
              >
                {article.category}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {formatDate(article.publishedAt)}
              </span>
            </div>
            <h2
              className="font-bold leading-snug line-clamp-2 transition-colors group-hover:text-[#f5c842]"
              style={{ color: "var(--text)" }}
            >
              {article.title}
            </h2>
          </div>
        </div>
        <p
          className="text-sm line-clamp-2 flex-1 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {summary}
        </p>
        <div
          className="mt-3 text-xs font-medium group-hover:underline"
          style={{ color: "var(--accent)" }}
        >
          続きを読む →
        </div>
      </div>
    </Link>
  );
}
