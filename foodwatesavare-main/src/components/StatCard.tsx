import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "",
  success: "stat-glow",
  warning: "",
  danger: "",
};

const iconVariants = {
  default: "bg-muted text-muted-foreground",
  success: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const valueVariants = {
  default: "",
  success: "text-primary",
  warning: "text-warning",
  danger: "text-destructive",
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up transition-all", variantStyles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className={cn("text-2xl font-extrabold tracking-tight", valueVariants[variant])}>{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>}
        </div>
        <div className={cn("p-2 rounded-lg", iconVariants[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
