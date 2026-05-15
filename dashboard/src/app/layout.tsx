import type { Metadata } from "next";
import "./globals.css";
import { TopNavigation } from "@/components/Layout/TopNavigation";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Zettlink Dashboard",
  description: "Personal Knowledge Management Dashboard",
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
          <main className="max-w-[1200px] mx-auto py-8 px-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
