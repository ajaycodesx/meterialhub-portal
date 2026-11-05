import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaterialHub Driver Dispatch | Heavy Materials Logistics",
  description: "Driver partner dispatch and route execution console for MaterialHub construction marketplace",
  manifest: "/manifest.json",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
