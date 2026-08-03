import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: {
    default: "SkillForge AI",
    template: "%s | SkillForge AI",
  },
  description:
    "AI-powered learning roadmap platform built with Next.js, TypeScript, MongoDB, JWT Authentication and Gemini AI.",
  keywords: [
    "SkillForge AI",
    "Learning Roadmap",
    "Gemini AI",
    "Next.js",
    "TypeScript",
    "MongoDB",
    "JWT",
    "AI Learning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-violet-100 text-slate-900">

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          expand={false}
          visibleToasts={4}
        />

      </body>
    </html>
  );
}