import "./globals.css";
import Providers from "./components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "AI Chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="forest">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <div className="flex justify-center items-center min-h-full flex-col">
            <NavBar />
            <main className="p-4 min-h-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
