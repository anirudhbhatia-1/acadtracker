import React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-surface text-foreground shadow-sm p-6 transition-shadow duration-150 hover:shadow-md",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2.5",
      className
    )}
    {...props}
  />
));
CardLabel.displayName = "CardLabel";

const CardHero = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-display text-4xl font-semibold leading-none text-foreground my-0.5",
      className
    )}
    {...props}
  />
));
CardHero.displayName = "CardHero";

const CardSupporting = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-medium text-text-muted mt-1.5 flex items-center gap-1", className)}
    {...props}
  />
));
CardSupporting.displayName = "CardSupporting";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1 pb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-snug tracking-tight text-foreground", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-text-muted", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center pt-4 border-t border-border mt-4", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { 
  Card, 
  CardLabel, 
  CardHero, 
  CardSupporting, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
};
export default Card;
