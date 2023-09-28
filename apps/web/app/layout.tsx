import "./globals.css";
import Providers from "./components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "./components/Navbar";
import HistoryMenu from "./components/HistoryMenu";

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
    <html lang="en" data-theme="dark">
      <body className={`${inter.className} `}>
        <Providers>
          <div className="flex justify-center items-center min-h-screen flex-col">
            <NavBar />
            <div className="flex flex-grow justify-between w-full">
              <HistoryMenu />
              <main className="flex flex-grow justify-between">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
