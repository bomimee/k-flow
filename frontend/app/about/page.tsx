"use client";
import { useEffect } from "react";
import Header from "../components/Header";
import Image from "next/image";

export default function About() {
  useEffect(() => {
    document.body.classList.add("bg-about");
    return () => {
      document.body.classList.remove("bg-about");
    };
  }, []);
  return (
    <>
      <Header />
      <section className="py-32 bg-black text-white">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* LEFT: Visual */}
          <div>
            <h1 className="text-2xl mb-6">About</h1>
            <Image
              src="/korean.png"
              alt="Abstract visualization of Korean language learning"
              width={500}
              height={500}
              className="opacity-80"
            />
          </div>

          <div>
            <h1 className="text-xl mb-6">
              {" "}
              We help learners understand real Korean, as it’s spoken in the
              real world.{" "}
            </h1>

            <p className="text-white max-w-md">
              Kolang is an AI-powered Korean learning platform that transforms
              YouTube videos into structured, level-based learning experiences.
            </p>
            <div>
              <h1 className="text-xl mb-6 mt-6">WHAT WE DO </h1>
              <p className="text-gray-400 max-w-md">
                Video-based Korean Learning
              </p>
              <p className="text-gray-400 max-w-md">AI Transcript Analysis</p>
              <p className="text-gray-400 max-w-md">
                Level-based Language Breakdown
              </p>
              <p className="text-gray-400 max-w-md">
                Context & Culture Explanation
              </p>
              <p className="text-gray-400 max-w-md">
                Key Expression Extraction
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
