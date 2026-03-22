import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
