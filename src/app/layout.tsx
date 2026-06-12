import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nitimo — Quản lý hệ thống",
  description: "Hệ thống quản lý",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="h-screen flex flex-col bg-gray-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}