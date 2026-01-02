// src/components/AnalysisCard.tsx
type AnalysisCardProps = {
  title: string;
  index: number;
  expression?: string;
  meaning?: string;
  usage_note?: string;
  pattern?: string;
  explanation?: string;
  pronunciation?:string;
  example_sentence?: string;
  flipable?: boolean; // 문법 카드처럼 뒤집기 가능 여부
  flipped?: boolean;
  onToggleFlip?: () => void;
};

export default function AnalysisCard({
  title,
  index,
  expression,
  pronunciation,
  meaning,
  usage_note,
  pattern,
  explanation,
  example_sentence,
  flipable = false,
  flipped = false,
  onToggleFlip,
}: AnalysisCardProps) {
  return (
    <div
      className={`rounded-xl p-4 transition border-2 border-[var(--brown)] w-70 h-80 flex flex-col ${
        flipable ? "cursor-pointer" : ""
      }`}
      onClick={flipable && onToggleFlip ? onToggleFlip : undefined}
    >
      {!flipable || !flipped ? (
        <>
          <p className="flex-1 flex text-xl font-bold text-[var(--lightbeige)]">
            {title} {index + 1}.
          </p>
          {expression && (
            <>
            <p className="flex-1 flex items-center justify-center text-xl font-bold text-[var(--background)]">
              {expression}
            </p>
            <p className="flex-1 flex items-center justify-center text-xl font-bold text-[var(--background)]">
              {pronunciation}
            </p>
            </>
          )}
          {pattern && (
            <p className="flex-1 flex items-center justify-center text-xl font-bold text-[var(--background)]">
              {pattern}
            </p>
          )}
          <div className="flex-1 flex flex-col justify-center">
            {meaning && <p className="text-sm text-gray-600">{meaning}</p>}
            {usage_note && (
              <p className="mt-2 text-sm text-blue-600">💡 {usage_note}</p>
            )}
            {explanation && (
              <p className="text-sm text-gray-700 mt-1">{explanation}</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center">
          {pattern && (
            <p className="text-xl font-bold text-[var(--background)] mt-10">
              {pattern}
            </p>
          )}
          {example_sentence && (
            <p className="mt-2 text-sm p-2 text-black">{example_sentence}</p>
          )}
        </div>
      )}
    </div>
  );
}
