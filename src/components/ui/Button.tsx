import { type ButtonHTMLAttributes } from "react";  

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
};

export default function Button
({ 
    variant = "primary", 
    className = "", 
    ...props 
}: ButtonProps) {
    const base = "h-11 px-12  rounded focus:ring-4 transition-colors";
    const variants = {
        primary: "bg-indigo-600 items-center hover:bg-indigo-500 text-white",
        secondary: "border border-zinc-800 bg-zinc-950/400 hover:bg-zinc-950/60 text-zinc-100",
        ghost: "bg-transparent hover:bg-zinc-900 text-zinc-100",
        };

    return (
        <button {...props}
        className={`${base} ${variants[variant]} ${className}`}
        />
    );
}