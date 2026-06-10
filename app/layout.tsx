import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat, Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.PUBLIC_BASE_URL ?? "https://cowork.synelia.tech"
  ),
  title: "Synelia Cowork",
  description:
    "Espace de travail IA collaboratif de la Direction Data & IA du Groupe Synelia.",
};

export const viewport = {
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono-brand",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${montserrat.variable} ${openSans.variable} ${jetbrainsMono.variable}`}
      lang="fr"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          forcedTheme="light"
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
