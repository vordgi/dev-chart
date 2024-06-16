import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({
  src: "../../public/GeistVF.woff2",
  fallback: [
    "Inter",
    "Segoe UI",
    "ui-sans-serif",
    "Roboto",
    "Noto Sans",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "Dev Chart | @nimpl",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
