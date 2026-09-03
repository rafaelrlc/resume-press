import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const body = Public_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
});

const mono = DM_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Resume Press — a JSON Resume builder",
  description:
    "Compose a résumé in the browser and watch the PDF set itself. JSON Resume in, PDF or JSON out. Everything stays on your machine.",
};

export const viewport: Viewport = {
  themeColor: "#12132b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
