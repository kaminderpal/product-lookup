import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walmart Product Lookup",
  description: "Search Walmart products with Next.js + Tailwind CSS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
