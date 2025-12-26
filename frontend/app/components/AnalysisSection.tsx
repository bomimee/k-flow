// src/components/AnalysisSection.tsx
import AnalysisCard from "./AnalysisCard";

type SectionProps<T> = {
  title: string;
  items: T[];
  type: "key_expression" | "grammar_point" | "practice"; // 카드 타입 구분
  flippedStates?: boolean[]; // 문법 카드 뒤집기 상태
  onToggleFlip?: (index: number) => void;
};

// AnalysisSection.tsx
export default function AnalysisSection<T>({
  title,
  items,
  type,
  flippedStates = [],
  onToggleFlip,
}: SectionProps<T>) {
  const sectionId = title.replace(/\s+/g, "-").toLowerCase(); // 예: "Key Expressions" → "key-expressions"

  return (
    <section id={sectionId} className="mt-20">
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item: T, idx: number) => (
  type === "practice" ? (
    <AnalysisCard
      key={idx}
      title={title}
      index={idx}
      expression={(item as any).korean}
      meaning={(item as any).english}
    />
  ) : (
    <AnalysisCard
      key={idx}
      title={title}
      index={idx}
      expression={type === "key_expression" ? (item as any).expression : undefined}
      meaning={type === "key_expression" ? (item as any).meaning_en : undefined}
      usage_note={type === "key_expression" ? (item as any).usage_note : undefined}
      pattern={type === "grammar_point" ? (item as any).pattern : undefined}
      explanation={type === "grammar_point" ? (item as any).explanation_en : undefined}
      example_sentence={type === "grammar_point" ? (item as any).example_sentence : undefined}
      flipable={type === "grammar_point"}
      flipped={flippedStates[idx]}
      onToggleFlip={() => onToggleFlip && onToggleFlip(idx)}
    />
  )
))}

      </div>
    </section>
  );
}
