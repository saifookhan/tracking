import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Property tracker",
  description: "Track rent, loan payments, expenses, and cashflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 50,
            padding: 8,
            borderRadius: 12,
            border: "1px solid color-mix(in srgb, var(--foreground), transparent 85%)",
            background: "color-mix(in srgb, var(--background), var(--foreground) 4%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
