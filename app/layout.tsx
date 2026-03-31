import type { Metadata } from "next";
import { Noto_Sans_JP, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-sans-jp",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

export const metadata: Metadata = {
  title: "で、どうなるの？ | やわらかニュース",
  description:
    "毎朝6時にAIが自動収集。日本人の生活・家計に影響するニュースをやさしい言葉で解説します。",
  openGraph: {
    title: "で、どうなるの？",
    description: "毎朝6時にAIが自動収集。やわらかニュース解説メディア",
    siteName: "で、どうなるの？",
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
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${bebasNeue.variable} h-full`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6249792468762529"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
