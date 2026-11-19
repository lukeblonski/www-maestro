import type { Metadata } from "next";
import { PRODUCT_NAME, content } from "@/lib/content";
import "./globals.css";
export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  applicationName: PRODUCT_NAME,
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg` },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
