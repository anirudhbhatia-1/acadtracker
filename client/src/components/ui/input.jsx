import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-text-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink dark:focus-visible:ring-chalk-teal disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
export default Input;
