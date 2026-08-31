import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://resumeforge-bay-eight.vercel.app"
  ),

  title: "ResumeForge — AI Resume to Portfolio",

  description:
    "Transform your resume into a professional portfolio using AI. Upload your resume, choose a theme, and publish your portfolio in seconds.",

  openGraph: {
    title: "ResumeForge — AI Resume to Portfolio",

    description:
      "Transform your resume into a professional portfolio using AI.",

    url: "https://resumeforge-bay-eight.vercel.app",

    siteName: "ResumeForge",

    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeForge — AI Resume to Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "ResumeForge — AI Resume to Portfolio",

    description:
      "Transform your resume into a professional portfolio using AI.",

    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}