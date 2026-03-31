import Header from "@/components/Header";

export const metadata = {
  title: "お問い合わせ | で、どうなるの？",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-black mb-2" style={{ color: "var(--accent)" }}>
            お問い合わせ
          </h1>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            記事の内容に関するご指摘・ご意見・その他お問い合わせはこちらから。
          </p>

          <div
            className="rounded-xl p-6 border mb-8"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              メールでのお問い合わせ
            </p>
            <a
              href="mailto:tas.studio@gmail.com"
              className="text-lg font-bold hover:underline break-all"
              style={{ color: "var(--accent)" }}
            >
              tas.studio@gmail.com
            </a>
          </div>

          <div
            className="rounded-xl p-5 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text)" }}>
              よくあるお問い合わせ
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "記事の内容に誤りがある",
                  a: "AIが自動生成した記事のため、誤りが含まれる場合があります。ご指摘いただければ確認・修正いたします。",
                },
                {
                  q: "記事の削除を希望する",
                  a: "削除希望の記事URLと理由をメールにてお送りください。内容を確認の上、対応いたします。",
                },
                {
                  q: "広告・提携について",
                  a: "広告掲載・提携に関するご相談もメールにてお気軽にどうぞ。",
                },
              ].map(({ q, a }, i) => (
                <div key={i} className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                    Q. {q}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
