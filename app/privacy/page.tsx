import Header from "@/components/Header";

export const metadata = {
  title: "プライバシーポリシー | で、どうなるの？",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-black mb-2" style={{ color: "var(--accent)" }}>
            プライバシーポリシー
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            最終更新日：2026年3月31日
          </p>

          <div className="flex flex-col gap-8" style={{ color: "var(--text)" }}>
            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                1. 収集する情報
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                当サイト（で、どうなるの？）は、アクセス解析のためにGoogle Analyticsを使用しています。Google Analyticsはクッキーを使用してアクセス情報（ページビュー、滞在時間、参照元など）を収集します。収集された情報はGoogleのプライバシーポリシーに基づいて管理されます。個人を特定できる情報は収集していません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                2. 広告について
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                当サイトはGoogle AdSenseを使用した広告を掲載しています。Google AdSenseはクッキーを使用して、ユーザーの興味に合わせた広告を表示します。広告クッキーの使用を希望しない場合は、<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>Googleの広告設定ページ</a>からオプトアウトできます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                3. クッキー（Cookie）
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                当サイトはアクセス解析・広告配信のためにクッキーを使用しています。ブラウザの設定からクッキーを無効にすることができますが、一部の機能が正常に動作しなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                4. 免責事項
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                当サイトの記事はAIが自動生成したものであり、情報の正確性・完全性・最新性を保証するものではありません。記事の内容に基づいた判断・行動については、ご自身の責任においてお願いします。当サイトの利用によって生じた損害について、運営者は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                5. 著作権
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                当サイトに掲載されているコンテンツの著作権は運営者に帰属します。無断転載・複製を禁じます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                6. プライバシーポリシーの変更
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                本ポリシーは予告なく変更される場合があります。変更後の内容はこのページに掲載します。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--accent)" }}>
                7. お問い合わせ
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                プライバシーポリシーに関するお問い合わせは、<a href="/contact" className="hover:underline" style={{ color: "var(--accent)" }}>お問い合わせページ</a>からご連絡ください。
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
