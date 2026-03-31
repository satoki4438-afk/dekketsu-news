import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto border-t py-8"
      style={{ background: "#0d0d0d", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-black text-lg hover:opacity-80 transition-opacity" style={{ color: "var(--accent)" }}>
          で、どうなるの？
        </Link>
        <nav className="flex items-center gap-6 text-[12px]" style={{ color: "var(--text-muted)" }}>
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/contact" className="hover:text-[var(--accent)] transition-colors">
            お問い合わせ
          </Link>
        </nav>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          © {year} で、どうなるの？
        </p>
      </div>
    </footer>
  );
}
