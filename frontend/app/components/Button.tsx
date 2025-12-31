import Link from "next/link";

type ButtonProps = {
  link?: string;
  url?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
};

export default function Button({url, link, text, className, onClick }: ButtonProps) {
  if (url) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-24 h-12 flex items-center justify-center
                   bg-[var(--lemon)] rounded-full shrink-0 hover:bg-[var(--lightbeige)] text-black ${className}`}
      >
        {text}
      </button>
    );
  }
  if (link) {
    return (
      <Link
        href={`/${link}`}
        className="w-25 h-25 flex items-center justify-center text-black
                   bg-[var(--lemon)] rounded-full shrink-0 hover:bg-[var(--font)]"
      >
        {text}
      </Link>
    );
  }

  return (
   <button
      type="button"
      onClick={onClick}
      className={`w-25 h-25 flex items-center justify-center
                 bg-[var(--lemon)] rounded-full shrink-0 hover:bg-[var(--lightbeige)] text-black ${className}`}
    >
      {text}
    </button>


  );
}
