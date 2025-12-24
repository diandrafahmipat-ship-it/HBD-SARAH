import type { Metadata } from "next";
import { Inter, Caveat, Righteous, Dancing_Script } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const righteous = Righteous({ weight: "400", subsets: ["latin"], variable: "--font-righteous" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "Happy Birthday Sarah!",
  description: "A special journey for a special person.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable} ${righteous.variable} ${dancingScript.variable} antialiased bg-pink-50 overflow-hidden`}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
