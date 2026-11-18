import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

// Geologica covers Mongolian Cyrillic (Ө, Ү live in cyrillic-ext). Its SHRP axis sharpens
// the letterforms: headings use it at full strength, like cut glass; body text stays at 0.
const geologica = Geologica({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  axes: ["SHRP"],
  variable: "--font-geologica",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AGENCY — Санааг нөлөө болгоно.",
  description:
    "AGENCY — зорилгоо сонгож, маркетингийн багцаа өөрөө бүрдүүлэн үнийн урьдчилсан тооцоо авах платформ.",
};

export const viewport: Viewport = {
  themeColor: "#06070b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={geologica.variable}>
      <body>
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
