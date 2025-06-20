import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Gaelic Trips",
  description: "Gaelic Trips - GAA event and club travel platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-primary text-primary-foreground py-2 px-4">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="Gaelic Trips Logo"
                  width={120}
                  height={32}
                  priority
                />
                <span className="text-xl font-bold">Gaelic Trips</span>
            </Link>
            <div className="space-x-4">
              <Link href="/events" className="hover:underline">Events</Link>
              <Link href="/clubs" className="hover:underline">Clubs</Link>
              <Link href="/events/create" className="hover:underline">Create Event</Link>
              <Link href="/about" className="hover:underline">About Us</Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
