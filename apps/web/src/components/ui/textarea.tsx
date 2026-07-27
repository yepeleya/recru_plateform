import * as React from "react";
import { cn } from "./cn";
import { inputBase } from "./input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => {
  return <textarea ref={ref} rows={rows} className={cn(inputBase, "min-h-20 py-2.5", className)} {...props} />;
});
Textarea.displayName = "Textarea";
