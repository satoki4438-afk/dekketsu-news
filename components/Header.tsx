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
            <span
              className="hidden sm:inline text-[11px] tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              やわらかニュース
            </span>
          </div>
        </Link>
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

    </header>
  );
}
