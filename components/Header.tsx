import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">📰</span>
          <div>
            <div className="font-bold text-lg leading-tight text-gray-900">
              で、結局どうなの？
            </div>
            <div className="text-xs text-gray-500">バカでもわかるニュース解説</div>
          </div>
        </Link>
        <div className="text-xs text-gray-400 hidden sm:block">
          毎朝6時に自動更新
        </div>
      </div>
    </header>
  );
}
