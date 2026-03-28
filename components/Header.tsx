import Link from "next/link";

export default function Header() {
  const today = new Date()
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");

  return (
    <header
      className="border-b py-4 px-5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        background: "rgba(13,13,13,0.95)",
      }}
    >
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2">
          <span
            className="text-[22px] tracking-widest leading-none"
            style={{
              fontFamily: "var(--font-bebas-neue), sans-serif",
              color: "var(--accent)",
            }}
          >
            で、結局どうなの？
          </span>
          <span
            className="text-[11px] tracking-wider hidden sm:inline"
            style={{ color: "var(--text-muted)" }}
          >
            やわらかニュース
          </span>
        </div>
      </Link>
      <div
        className="text-[11px] px-3 py-1 rounded-full border"
        style={{
          color: "var(--text-muted)",
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {today}
      </div>
    </header>
  );
}
