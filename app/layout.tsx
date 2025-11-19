import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { HeaderWrapper } from "@/components/header-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSettingsProvider } from "@/components/theme/theme-settings-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile Restaurant Menu",
  description:
    "Customer ordering and restaurant dashboard experience for a mobile food delivery app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ThemeSettingsProvider>
            <HeaderWrapper />
            {children}
          </ThemeSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
