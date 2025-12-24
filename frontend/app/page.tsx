// src/app/page.tsx
import Link from "next/link";
import ButtonL from "./components/ButtonL";
import Button from "./components/Button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center text-center">
      <div className="w-full max-w-4xl mt-30 relative">
        <h1 className="text-5xl font-bold">KOLANG</h1>

        <div className="absolute right-0 top-0">
          <Button link="signin" text="Login" />
        </div>
      </div>

      <nav className="mt-10">
        <ul className="flex gap-8">
          <Link href="/" className="hover:text-[var(--lemon)]">Home</Link>
          <Link href="/about" className="hover:text-[var(--lemon)]">About</Link>
          <Link href="/practice" className="hover:text-[var(--lemon)]">Practice</Link>
          <Link href="/level" className="hover:text-[var(--lemon)]">Level</Link>
          <Link href="/contact" className="hover:text-[var(--lemon)]">Contact</Link>
        </ul>
      </nav>

      <div className="mt-40 mb-5">
        <ButtonL name="Start Learning" link="guide" />
      </div>

      <div
        className="
        mt-20
        text-[var(--lemon)]
        text-center
        text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl
        whitespace-nowrap lg:whitespace-nowrap
        leading-tight tracking-tight opacity-90
        "
        >
        Start Learning Korean With Your Favorite K-Contents
      </div>
    </section>
  );
}
