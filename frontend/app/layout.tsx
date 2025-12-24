// src/app/layout.tsx
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Montserrat } from "next/font/google";

export const metadata = {
  title: "K-Flow | Learn Korean with AI",
  description: "Learn Korean through K-Drama, K-Pop and AI",
};


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col --font-montserrat">
        <main className="flex-1 container mx-auto px-6 py-10">{children}</main>

      </body>
    </html>
  );
}
