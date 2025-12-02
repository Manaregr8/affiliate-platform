import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Affiliation Platform",
    template: "%s | Affiliation Platform",
  },
  description: "Affiliate onboarding, network oversight, and student admissions in one workspace.",
  icons: {
    icon: [
      { url: "/g109-8.png", type: "image/png" },
      { url: "/g109-8.png", sizes: "192x192", type: "image/png", rel: "shortcut icon" },
    ],
    apple: [{ url: "/g109-8.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sansFont.variable} ${monoFont.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors">
            {children}
          </div>
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
