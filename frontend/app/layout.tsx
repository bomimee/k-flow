// src/app/layout.tsx
import "./globals.css";
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

import { AuthProvider } from "./hooks/useAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col font-montserrat">
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
