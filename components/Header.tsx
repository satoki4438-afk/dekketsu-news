import Link from "next/link";

export default function Header() {
  const today = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(13,13,13,0.97)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* トップバー */}
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-noto-sans-jp), sans-serif",
                fontWeight: 900,
                fontSize: "38px",
                color: "var(--accent)",
                letterSpacing: "1px",
                lineHeight: 1,
              }}
            >
              で、どうなるの？
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <form action="/search" method="GET" className="hidden sm:flex items-center gap-1">
            <input
              type="search"
              name="q"
              placeholder="キーワード検索"
              className="w-36 px-3 py-1.5 rounded-full text-[12px] border outline-none focus:border-[var(--accent)] focus:w-48 transition-all"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                borderColor: "var(--border)",
              }}
            />
            <button
              type="submit"
              className="text-[18px] px-1 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="検索"
            >
              🔍
            </button>
          </form>
          <div
            className="text-[12px] px-3 py-1.5 rounded-full border hidden sm:block"
            style={{
              color: "var(--text-muted)",
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {today}
          </div>
        </div>
      </div>

    </header>
  );
}
