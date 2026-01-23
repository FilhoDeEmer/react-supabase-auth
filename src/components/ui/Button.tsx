import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
};


export default function Button({
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    ...props
}: ButtonProps) {
    const base = 
    "inline-flex items-center justify-center rounded-lg dont-semibold transition" +
    "disabled:opacity-60 disabled:cursor-not-allowed"

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
    };

    const variants = {
        primary: "bg-indigo-600 text-white hovwe:bg-indigo-500",
        secondary: "border border-zinc-600 bg-zinc-950/40 text-zinc-100 hover:bg-zinc-950/60",
        ghost: "bg-transparent text-zinc-100 hover:bg-zinc-900",
        danger: "bg-red-600 text-white hover:bg-red-500",
    };

    return(
        <button 
        {...props}
        type={type}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        />
    );

}