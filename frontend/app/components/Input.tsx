import Button from "./Button";

type InputProps = {
  link: string;
  value: string;
  text: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
};

export default function Input({
  link,
  value,
  text,
  onChange,
  onAnalyze,
}: InputProps) {
  return (
    <div className="mt-10 flex items-center gap-4 justify-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xl rounded-full px-4 py-2
                   bg-[var(--font)] text-black"
        placeholder="link here"
      />

      <Button link={link} onClick={onAnalyze} text={text}/>
    </div>
  );
}
