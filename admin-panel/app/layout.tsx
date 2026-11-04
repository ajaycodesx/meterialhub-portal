import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaterialHub Admin Console | Marketplace Operations & Rates",
  description: "Executive control panel for spot commodity rates, merchant verification, and platform audit logs",
  robots: {
    index: false,
    follow: false,
  },
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
