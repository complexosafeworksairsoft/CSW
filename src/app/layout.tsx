import type { Metadata } from "next";
import {
  Oswald,
  Big_Shoulders_Stencil,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSiteImage } from "@/lib/site-images";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bigShouldersStencil = Big_Shoulders_Stencil({
  variable: "--font-big-shoulders-stencil",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Complexo Safe Works | Mossoró/RN",
  description:
    "Complexo Safe Works: campo de jogo, oficina de manutenção, loja e escola tática de airsoft em Mossoró/RN.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Read here (a Server Component) rather than inside Nav.tsx (a Client
  // Component) — see the note in Nav.tsx for why.
  const logoPhoto = getSiteImage("nav.logo");

  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${bigShouldersStencil.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        <Nav logoPhoto={logoPhoto} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
