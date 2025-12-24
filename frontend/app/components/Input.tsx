
import Button from "./Button";

type InputProps = {
  link: string;
};

export default function Input({ link }: InputProps) {
    return(
         <div className="mt-10 flex items-center gap-4 justify-center">
        <input
          type="text"
          className="w-full max-w-xl rounded-full px-4 py-2
               bg-[var(--font)] text-black"
          placeholder="please provide youtube link"
        />

        <Button link={link} text=""/>
      </div>
    )
}