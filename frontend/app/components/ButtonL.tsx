import Link from "next/link";

type ButtonLProps = {
  name: string;
  link: string;
};

export default function ButtonL({ name, link }: ButtonLProps) {
  return (
    <Link
      href={`/${link}`}
      className="w-full max-w-xl rounded-full px-20 py-3
                 bg-[var(--font)] text-black hover:bg-[var(--lemon)]"
    >
      {name}
    </Link>
  );
}
