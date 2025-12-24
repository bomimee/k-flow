import Link from "next/link";

type ButtonProps = {
  link: string;
  text: string;
};

export default function Button({ link , text}: ButtonProps) {
  return (
    <Link
      href={`/${link}`}
      className="w-14 h-14 flex items-center justify-center
                 bg-[var(--lemon)] rounded-full shrink-0 text-black font-bold hover:bg-[var(--font)]"
    >
      {text}
    </Link>
  );
}
