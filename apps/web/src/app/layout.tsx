import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s | CodePro", default: "CodePro — Competitive Programming" },
  description:
    "CodePro is a competitive programming platform to sharpen your algorithmic problem solving skills. Participate in contests, solve problems, and climb the leaderboard.",
  keywords: ["competitive programming", "algorithms", "contests", "coding"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CodePro",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
