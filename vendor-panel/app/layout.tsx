import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaterialHub Vendor Portal | Merchant Stock & Order Fulfillment",
  description: "Merchant partner dashboard for inventory management, live order packing, and sales analytics",
  manifest: "/manifest.json",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-50/60 text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
