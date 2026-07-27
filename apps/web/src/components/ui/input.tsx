import * as React from "react";
import { cn } from "./cn";

export const inputBase =
  "w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 " +
  "disabled:opacity-60 disabled:pointer-events-none aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/25";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return <input ref={ref} type={type} className={cn(inputBase, "h-11", className)} {...props} />;
  },
);
Input.displayName = "Input";
