import type { Metadata } from "next";
import {
  DM_Serif_Display,
  DM_Serif_Text,
  IBM_Plex_Mono,
} from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/providers/theme-provider";
import QueryProvider from "@/providers/query-provider";
import { AuthErrorToast } from "@/components/auth/AuthErrorToast";

import "./globals.css";

const serifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif-display",
});

const serifText = DM_Serif_Text({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | Traqon",
    default: "Traqon",
  },
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serifDisplay.variable} ${serifText.variable} ${mono.variable}`}
    >
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Suspense fallback={null}>
              <AuthErrorToast />
            </Suspense>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
