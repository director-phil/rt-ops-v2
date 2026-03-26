import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RT Ops — Reliable Tradies",
  description: "Operations Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ background: "#0a0a0a", color: "#f9fafb", margin: 0, padding: 0, minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
