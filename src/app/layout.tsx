import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syncopate } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hackwaveportal.vercel.app'),
  title: "HACKWAVE 2026 | Dept. of CT - PG Hackathon",
  description: "Two Phases. One Big Idea. The premier hackathon for CT-PG students.",
  keywords: ["hackathon", "HACKWAVE", "CT-PG", "coding competition", "college hackathon", "student projects", "tech event"],
  openGraph: {
    title: "HACKWAVE 2026",
    description: "Dept. of CT - PG Hackathon 2026. Register your team now.",
    url: 'https://hackwaveportal.vercel.app',
    siteName: 'HACKWAVE 2026',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} ${jakarta.variable} ${syncopate.variable}`}>
        {children}
      </body>
    </html>
  );
}
