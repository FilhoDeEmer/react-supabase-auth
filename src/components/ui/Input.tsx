import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
    return (
        <input 
            {...props}
            className={`w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 ${className}`}

            />
    );
}