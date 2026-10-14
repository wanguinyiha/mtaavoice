import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-strong disabled:hover:bg-brand",
  secondary:
    "border border-brand bg-white text-brand hover:bg-brand-soft disabled:hover:bg-white",
  danger:
    "border border-danger bg-white text-danger hover:bg-danger-soft disabled:hover:bg-white",
  ghost: "text-brand hover:bg-brand-soft disabled:hover:bg-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "rounded-md px-3 py-1.5 text-xs font-semibold",
  md: "rounded-lg px-4 py-3 text-sm font-semibold",
  lg: "rounded-[10px] px-6 py-4 text-base font-semibold",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={16} label="Working" /> : null}
      {children}
    </button>
  );
}
