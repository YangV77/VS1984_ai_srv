import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_SC } from "next/font/google";

import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-sans-sc",
});

export const metadata: Metadata = {
  title: "PKN Console",
  description: "Responsive bilingual console for base, client, provider, and indexer roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${notoSansSc.variable} font-[family-name:var(--font-sans-sc),var(--font-sans)] antialiased`}>
        {children}
      </body>
    </html>
  );
}

