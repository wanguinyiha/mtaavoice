import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({
  label,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-neutral-800"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-400",
          "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          error ? "border-danger" : "border-line-strong",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
