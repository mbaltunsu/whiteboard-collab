import type { Metadata } from "next";
import "./globals.css";
import { Geist, Manrope, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CollaborativeWhiteBoard",
    template: "%s | CollaborativeWhiteBoard",
  },
  description:
    "A realtime collaborative whiteboard with CRDT-based conflict resolution and live cursor presence.",
  keywords: ["whiteboard", "collaboration", "realtime", "drawing"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CollaborativeWhiteBoard",
    description: "Realtime collaborative whiteboard with live presence.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, manrope.variable, inter.variable)}
    >
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
