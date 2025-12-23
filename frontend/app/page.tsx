// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="text-center space-y-8">
      <h1 className="text-4xl font-bold">Learn Korean with Your Favorate K-Contents ✨</h1>

      <p className="text-lg text-gray-600">
        Understand real Korean from K-Drama, K-Pop, and everyday conversations.
      </p>

      <Link
        href="/practice"
        className="inline-block bg-black text-white px-6 py-3 rounded-lg"
      >
        Try Practice
      </Link>
    </section>
  );
}
