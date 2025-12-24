// src/app/components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-[var(--font)] rounded-lg mb-10">
      <nav className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black">         
          <span>KOLANG</span>
        </Link>

        {/* Navigation */}
        <div className="space-x-6 text-sm font-medium text-black">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/practice" className="hover:underline">
            Practice
          </Link>
          <Link href="/practice" className="hover:underline">
            Practice
          </Link>
          <Link href="/level" className="hover:underline">
            Level
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
