import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Job-Agent React",
  description: "React/Next.js replication of JOB-Agent optimized for Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <Nav />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
            <div className="mx-auto max-w-5xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
