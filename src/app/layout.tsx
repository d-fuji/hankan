import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "藩鑑 - Hankan",
  description:
    "江戸時代の藩・藩主・石高を横断的に検索・閲覧できるデータベース",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSerif.variable} ${notoSans.variable} font-[family-name:var(--font-noto-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
