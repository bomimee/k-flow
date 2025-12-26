type LearningPoingProps = {
  title: string;
  active?: boolean;
  onClick?: () => void;
};

export default function LearninPoint({ title, active, onClick }: LearningPoingProps) {
  return (
    <div
      className={`cursor-pointer rounded-full w-100 flex items-center justify-center p-4 transition-shadow duration-300
        ${
          active
            ? "bg-[var(--brown)] text-[var(--font)] shadow-xl"
            : "bg-[var(--lightbeige)] hover:shadow-md"
        }`}
      onClick={onClick}
    >
      {title}
    </div>
  );
}
