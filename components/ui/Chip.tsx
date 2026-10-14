import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
};

export function Chip({
  selected,
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-colors",
        selected
          ? "border-brand bg-brand font-semibold text-white"
          : "border-line-strong bg-white text-neutral-700 hover:border-brand hover:text-brand",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
