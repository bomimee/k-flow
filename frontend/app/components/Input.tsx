type InputProps = {
  value?: string;
  text?: string;
  onChange: (value: string) => void;
};

export default function Input({
  value,
  onChange,
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

     
    </div>
  );
}
