import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/wasteless";

const labels: Record<RiskLevel, string> = { high: "High", medium: "Medium", low: "Low" };

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        level === "high" && "risk-badge-high",
        level === "medium" && "risk-badge-medium",
        level === "low" && "risk-badge-low"
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        level === "high" && "bg-risk-high animate-pulse-glow",
        level === "medium" && "bg-risk-medium",
        level === "low" && "bg-risk-low"
      )} />
      {labels[level]}
    </span>
  );
}
