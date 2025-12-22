// src/app/layout.tsx
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "K-Flow | Learn Korean with AI",
  description: "Learn Korean through K-Drama, K-Pop and AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
