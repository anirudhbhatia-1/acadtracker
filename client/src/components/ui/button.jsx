import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-ink dark:bg-chalk-teal text-white hover:opacity-90 shadow-sm",
    primary: "bg-ink dark:bg-chalk-teal text-white hover:opacity-90 shadow-sm",
    secondary: "border border-ink dark:border-chalk-teal text-ink dark:text-chalk-teal bg-transparent hover:bg-surface-2",
    accent: "bg-chalk-teal text-white hover:opacity-90 shadow-sm",
    outline: "border border-border bg-transparent text-foreground hover:bg-surface-2",
    ghost: "bg-transparent border-transparent text-text-muted hover:text-foreground hover:bg-surface-2",
    destructive: "border border-status-critical text-status-critical bg-transparent hover:bg-status-critical hover:text-white transition-colors",
  },
  size: {
    default: "py-2 px-4 text-[13px]",
    sm: "py-1.5 px-3 text-xs",
    lg: "py-2.5 px-5 text-sm",
    icon: "w-8 h-8 p-0 flex items-center justify-center",
  },
};

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}, ref) => {
  const variantClass = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClass = buttonVariants.size[size] || buttonVariants.size.default;

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-sans font-semibold whitespace-nowrap transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-ink dark:focus-visible:ring-chalk-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
