import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "RT Ops — Reliable Tradies",
  description: "Operations Platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen pb-20">
        {/* Orange brand header bar */}
        <div
          className="sticky top-0 z-40 flex items-center px-4 py-2 text-white text-sm font-bold shadow"
          style={{ background: "#FF4500" }}
        >
          <span className="mr-2">⚡</span>
          <span>RT OPS</span>
          <span className="ml-2 text-xs font-normal opacity-75">Reliable Tradies</span>
        </div>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
