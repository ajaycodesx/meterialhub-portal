import type { Metadata, Viewport } from "next";
import React from "react";
import { Urbanist, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { AppShell } from "../components/layout/AppShell";
import { GsapScrollTriggerProvider } from "../components/common/GsapScrollTriggerProvider";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaterialHub - Wholesale Construction Materials Platform",
  description: "Direct B2B and retail marketplace for Cement, TMT Steel, PVC Pipes, Paints & Hardware.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          <GsapScrollTriggerProvider>
            <AppShell>{children}</AppShell>
          </GsapScrollTriggerProvider>
        </AppProvider>
      </body>
    </html>
  );
}
