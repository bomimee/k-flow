// src/app/components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          K-Flow
        </Link>

        <div className="space-x-6">
          <Link href="/practice">Practice</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>
    </header>
  );
}
