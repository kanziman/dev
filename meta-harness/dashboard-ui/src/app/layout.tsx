import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { TopNavigation } from "@/components/Layout/TopNavigation";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "meta-harness",
  description: "AI Agent Activity Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNavigation />
          <nav className="border-b border-line-normal-normal bg-background-normal-alternative">
            <div className="w-full max-w-[1200px] mx-auto px-6 flex gap-6 h-10 items-center">
              <Link
                href="/"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/stats"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/traces"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Traces
              </Link>
            </div>
          </nav>
          <main className="max-w-[1200px] mx-auto py-8 px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
