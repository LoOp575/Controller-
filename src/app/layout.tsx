import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeAI Controller - Multi-Agent Task Router",
  description: "AI command center for multi-agent task orchestration and control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#EAF8F8] antialiased">
        {children}
      </body>
    </html>
  );
}
