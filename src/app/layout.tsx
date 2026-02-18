import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GardenGrid - Plan Your Perfect Garden",
  description: "An intelligent garden planning companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
