import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "で、結局どうなの？ | バカでもわかるニュース解説",
  description: "毎朝6時にAIが自動収集。日本人の生活・家計に影響するニュースを小学生でもわかる言葉で解説します。",
  openGraph: {
    title: "で、結局どうなの？",
    description: "毎朝6時にAIが自動収集。バカでもわかるニュース解説メディア",
    siteName: "で、結局どうなの？",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
