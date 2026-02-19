import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Lookup",
  description: "Search products with Next.js + Tailwind CSS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
