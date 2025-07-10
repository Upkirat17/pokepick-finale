import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TeamSidebar from '../components/TeamSidebar';
import Navbar from '../components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokePick",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex flex-1">
            <main className="flex-1">{children}</main>
            <TeamSidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
