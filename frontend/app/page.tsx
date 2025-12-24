// src/app/page.tsx
import Link from "next/link";

import ButtonL from "./components/ButtonL";

export default function HomePage() {
  return (
    <>
      <section className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mt-20">KOLANG</h1>

        <div className="mt-10 flex flex-col items-center space-y-8 mb-30">
          <ul className="flex gap-8">
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
          </ul>
        </div>
      <ButtonL name="Enter" link="guide"/>
      </section>

    </>
  );
}
