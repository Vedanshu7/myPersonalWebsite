import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./providers";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = "https://vedanshujoshi.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Vedanshu Joshi | Software Engineer",
    template: "%s | Vedanshu Joshi",
  },
  description:
    "Vedanshu Joshi is a Software Engineer with an MS in Computer Science from Purdue University, specializing in full-stack systems across .NET, React, Node.js, and cloud infrastructure.",
  keywords: [
    "Vedanshu Joshi",
    "software engineer",
    "full-stack developer",
    "Next.js",
    "React",
    ".NET",
    "Node.js",
    "TypeScript",
    "Purdue University",
    "cloud infrastructure",
    "web developer",
  ],
  authors: [{ name: "Vedanshu Joshi", url: BASE }],
  creator: "Vedanshu Joshi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE,
  },
  openGraph: {
    title: "Vedanshu Joshi | Software Engineer",
    description:
      "Full-stack engineer with MS Computer Science from Purdue University. Building systems with .NET, React, Node.js, and cloud.",
    url: BASE,
    siteName: "Vedanshu Joshi",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vedanshu Joshi | Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedanshu Joshi | Software Engineer",
    description: "Full-stack engineer with MS Computer Science from Purdue University.",
    images: ["/opengraph-image"],
    creator: "@vedanshu7",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <JsonLd />
          <ReadingProgress />
          {children}
          <BackToTop />
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
