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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex justify-center items-center h-full flex-col">
            <NavBar />
            <div className="p-4">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
