import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Pin, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeIcons = {
  safe: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertCircle,
  info: Info,
  pinned: Pin,
  predicted: TrendingUp,
  overdue: Clock,
};

const badgeStyles = {
  safe: "bg-safe-tint text-status-safe",
  warning: "bg-warn-tint text-status-warning",
  critical: "bg-crit-tint text-status-critical",
  info: "bg-info-tint text-status-info",
  pinned: "bg-info-tint text-status-info",
  predicted: "bg-info-tint text-status-info",
  overdue: "bg-crit-tint text-status-critical",
};

const Badge = React.forwardRef(({ 
  className, 
  variant = "info", 
  icon: CustomIcon, 
  showIcon = true, 
  children, 
  ...props 
}, ref) => {
  const IconComponent = CustomIcon || badgeIcons[variant] || badgeIcons.info;
  const styleClass = badgeStyles[variant] || badgeStyles.info;

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap select-none",
        styleClass,
        className
      )}
      {...props}
    >
      {showIcon && IconComponent && (
        <IconComponent className="w-3.5 h-3.5 flex-shrink-0 fill-current/15" />
      )}
      <span>{children}</span>
    </span>
  );
});

Badge.displayName = "Badge";

export { Badge, badgeStyles };
export default Badge;
