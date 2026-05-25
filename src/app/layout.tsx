import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "NodeAI Controller + NusaTani AI",
  description: "AI command center with multi-agent task router and buyer intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#EAF8F8] antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 lg:ml-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
