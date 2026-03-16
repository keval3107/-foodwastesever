import { useProducts } from "@/hooks/useProducts";
import { analyzeAllProducts } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { AlertTriangle, Clock, TrendingUp, Package, Gauge, ArrowDown, Megaphone, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

function RiskCard({ a }: { a: ReturnType<typeof analyzeAllProducts>[0] }) {
  const borderColor = a.riskLevel === "high" ? "border-l-risk-high" : "border-l-risk-medium";
  return (
    <div className={cn("glass-card rounded-xl p-5 border-l-[3px] animate-slide-up hover:shadow-md transition-all", borderColor)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-[13px]">{a.product.name}</p>
          <p className="text-[11px] text-muted-foreground">{a.product.category} · {a.product.warehouse}</p>
        </div>
        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md",
          a.riskScore >= 70 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
        )}>
          {a.riskScore}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {a.daysToExpiry <= 0 ? "Expired" : `${a.daysToExpiry}d left`}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Package className="h-3 w-3" /> {a.product.quantity} units
        </div>
      </div>
      <div className="p-3 rounded-lg bg-accent/60 text-[11px] mb-2">
        <div className="flex items-center gap-1.5 font-medium text-accent-foreground mb-0.5">
          <TrendingUp className="h-3 w-3" /> Smart Action
        </div>
        <p className="text-muted-foreground leading-relaxed">{a.recommendedAction}</p>
        {a.discountPercent > 0 && (
          <p className="mt-1 font-semibold text-primary">₹{a.product.price.toFixed(2)} → ₹{a.discountedPrice.toFixed(2)} ({a.discountPercent}% off)</p>
        )}
      </div>
      {a.promotionMessage && (
        <div className="flex items-center gap-1.5 text-[10px] text-primary bg-primary/8 rounded-md px-2 py-1.5 mb-1.5">
          <Megaphone className="h-3 w-3 flex-shrink-0" />{a.promotionMessage}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ArrowDown className="h-3 w-3" />{a.procurementAdvice}
      </div>
    </div>
  );
}

export default function Risks() {
  const { products } = useProducts();
  const analyses = analyzeAllProducts(products).sort((a, b) => b.riskScore - a.riskScore);
  const highRisk = analyses.filter(a => a.riskLevel === "high");
  const mediumRisk = analyses.filter(a => a.riskLevel === "medium");

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Monitor</h1>
          <p className="text-sm text-muted-foreground">AI-powered risk scoring · {analyses.length} products analyzed</p>
        </div>
      </div>

      {highRisk.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/8 border border-destructive/20 mb-6 animate-slide-up">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">{highRisk.length} products at critical risk</p>
            <p className="text-[11px] text-muted-foreground">These items expire within 2 days and need immediate action.</p>
          </div>
        </div>
      )}

      {highRisk.length > 0 && (
        <>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-risk-high animate-pulse-glow" />
            High Risk — Expiring within 2 days
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {highRisk.map(a => <RiskCard key={a.product.id} a={a} />)}
          </div>
        </>
      )}

      {mediumRisk.length > 0 && (
        <>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-risk-medium" />
            Medium Risk — Expiring within 3–5 days
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {mediumRisk.map(a => <RiskCard key={a.product.id} a={a} />)}
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-chart-blue" />
        Overstock & Procurement
      </h2>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                {["Product", "Stock", "Demand (3d)", "Surplus", "Score", "Smart Action", "Procurement"].map(h => (
                  <th key={h} className="text-left py-3 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyses.filter(a => a.isOverstock).map(a => (
                <tr key={a.product.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3.5 font-semibold text-[13px]">{a.product.name}</td>
                  <td className="py-3 px-3.5 font-mono text-xs">{a.product.quantity}</td>
                  <td className="py-3 px-3.5 font-mono text-xs">{a.predictedDemand}</td>
                  <td className="py-3 px-3.5 font-mono text-xs text-warning">+{a.product.quantity - a.predictedDemand}</td>
                  <td className="py-3 px-3.5">
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md",
                      a.riskScore >= 70 ? "bg-destructive/10 text-destructive" :
                      a.riskScore >= 40 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                    )}>{a.riskScore}%</span>
                  </td>
                  <td className="py-3 px-3.5 text-[11px] text-muted-foreground">{a.recommendedAction}</td>
                  <td className="py-3 px-3.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ArrowDown className="h-3 w-3" />{a.procurementAdvice}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
