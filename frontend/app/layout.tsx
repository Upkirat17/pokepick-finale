import type { Metadata } from "next";
import { Geist, Geist_Mono, Pixelify_Sans, Jersey_15 } from "next/font/google";
import "./globals.css";
import TeamSidebar from '../components/TeamSidebar';
import Navbar from '../components/Navbar';
import Navigation from "../components/Navigation"
import Footer from '../components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

const jersey = Jersey_15({
  weight: "400",
  variable: "--font-jersey",
});

export const metadata: Metadata = {
  title: "PokePick",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelify.variable} ${jersey.variable}`}
      >
      <body className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <div className="flex flex-1">
            <main className="flex-1">{children}</main>
            <TeamSidebar />
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
