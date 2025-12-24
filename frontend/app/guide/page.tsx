import Button from "../components/Button";
import Header from "../components/Header";

export default function Guide() {
  return (
    <>
      <Header />

      <section className="mt-40 grid grid-cols-1 md:grid-cols-2 items-center px-8 md:px-20 gap-12">
        <div className="flex justify-center md:justify-start">
          <h1 className="text-4xl md:text-5xl font-bold">
            How to use ?
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-4">
            <li className="bg-[var(--lemon)] rounded-xl px-6 py-4 text-black shadow-sm hover:bg-[var(--font)]">
              Learn Korean through K-contents you love
            </li>
            <li className="bg-[var(--lemon)] rounded-xl px-6 py-4 text-black shadow-sm hover:bg-[var(--font)]">
              Just paste the YouTube link to get started.
            </li>
            <li className="bg-[var(--lemon)] rounded-xl px-6 py-4 text-black shadow-sm hover:bg-[var(--font)]">
              Please choose a video that is around 20 minutes or less.
            </li>
            <li className="bg-[var(--lemon)] rounded-xl px-6 py-4 text-black shadow-sm hover:bg-[var(--font)]">
              Videos with Korean subtitles work best.
            </li>
          </ul>

          <div className="self-end mt-6">
            <Button link="practice" text="Go"/>
          </div>
        </div>
      </section>
    </>
  );
}
