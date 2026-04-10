import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://techrank-demo.vercel.app"),
  title: {
    default: "TechRank — จัดอันดับอุปกรณ์ไอที",
    template: "%s | TechRank",
  },
  description: "ค้นหาและเปรียบเทียบอุปกรณ์ไอทีที่ดีที่สุด จัดอันดับอย่างเป็นกลาง รีวิวจากการใช้งานจริง",
  openGraph: {
    title: "TechRank — จัดอันดับอุปกรณ์ไอที",
    description: "ค้นหาและเปรียบเทียบอุปกรณ์ไอทีที่ดีที่สุด จัดอันดับอย่างเป็นกลาง รีวิวจากการใช้งานจริง",
    url: "https://techrank-demo.vercel.app",
    siteName: "TechRank",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechRank — จัดอันดับอุปกรณ์ไอที",
    description: "ค้นหาและเปรียบเทียบอุปกรณ์ไอทีที่ดีที่สุด จัดอันดับอย่างเป็นกลาง รีวิวจากการใช้งานจริง",
  },
  verification: {
    google: "mMVOj4jmkOhSn44v-AnPCGM28H_1K350U2RwoZYNHjA",
  },
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAllCategories } from "@/lib/queries";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('techrank-theme') || 'light';
                  var resolved = t;
                  if (t === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                  if (resolved === 'dark') {
                    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col font-sans bg-background text-foreground`}
      >
        <ThemeProvider>
          <Header categories={categories} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
