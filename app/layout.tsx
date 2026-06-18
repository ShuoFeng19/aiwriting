import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-assisted CT-oriented Writing Practice",
  description: "A structured AI-assisted argumentative writing workflow for EFL learners.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="font-semibold text-slate-900">
              AI-assisted CT-oriented Writing Practice
            </Link>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              v7
            </span>
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">
              Teacher export
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
