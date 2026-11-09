import type { Metadata } from "next";
import { PRODUCT_NAME, content } from "@/lib/content";
import "./globals.css";
export const metadata: Metadata = {
  title: content.meta.title,
  description: content.hero.description,
  applicationName: PRODUCT_NAME,
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg` },
};
const themeScript = `(function(){try{var t=localStorage.getItem('maestro-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})();`;
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
