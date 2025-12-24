import Link from "next/link";

type ButtonProps = {
  link?: string;
  text?: string;
  onClick?: () => void;
};

export default function Button({ link, text, onClick }: ButtonProps) {
  if (link) {
    return (
      <Link
        href={`/${link}`}
        className="w-14 h-14 flex items-center justify-center
                   bg-[var(--lemon)] rounded-full shrink-0"
      >
        →
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-14 h-14 flex items-center justify-center
                 bg-[var(--lemon)] rounded-full shrink-0 hover:bg-[var(--font)]"
    >
      {text}
    </button>
  );
}
