import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerCleanup } from "@/components/sw-cleanup";
import {
  PINTAR_DESCRIPTION,
  PINTAR_FULL_TITLE,
  PINTAR_NAME,
} from "@/lib/branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: PINTAR_FULL_TITLE,
    template: `%s — ${PINTAR_NAME}`,
  },
  description: PINTAR_DESCRIPTION,
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        {children}
        <ServiceWorkerCleanup />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
