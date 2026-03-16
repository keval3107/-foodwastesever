import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { analyzeAllProducts, getStats, getSustainabilityMetrics, getWarehouseRiskData, getWastePrediction } from "@/lib/wasteless";
import { generateWasteReport } from "@/lib/pdfReport";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Package, AlertTriangle, Leaf, IndianRupee, FileDown, Gauge, Zap, Clock, Warehouse, ShoppingBag, ArrowRight, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const RISK_COLORS = ["hsl(0, 72%, 51%)", "hsl(30, 90%, 50%)", "hsl(168, 70%, 36%)"];

function RiskScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "text-destructive" : score >= 40 ? "text-warning" : "text-primary";
  const bg = score >= 70 ? "bg-destructive/8" : score >= 40 ? "bg-warning/8" : "bg-primary/8";
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border border-border/50 transition-all hover:border-border", bg)}>
      <div className="relative w-11 h-11 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${score} ${100 - score}`} className={color} strokeLinecap="round" />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-[10px] font-bold", color)}>{score}</span>
      </div>
      <span className="text-xs font-medium truncate leading-tight">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const analyses = analyzeAllProducts(products);
  const stats = getStats(analyses);
  const sustainability = getSustainabilityMetrics(analyses, 0);
  const warehouseData = getWarehouseRiskData(analyses);
  const wastePrediction = getWastePrediction(analyses);

  const riskData = [
    { name: "High Risk", value: stats.highRisk, fill: RISK_COLORS[0] },
    { name: "Medium Risk", value: stats.mediumRisk, fill: RISK_COLORS[1] },
    { name: "Low Risk", value: stats.lowRisk, fill: RISK_COLORS[2] },
  ];

  const topRiskItems = [...analyses].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);

  const stockVsDemand = analyses.slice(0, 5).map(a => ({
    name: a.product.name.split(" ").slice(0, 2).join(" "),
    stock: a.product.quantity,
    demand: a.predictedDemand,
  }));

  const tooltipStyle = {
    background: "hsl(210, 25%, 8%)",
    border: "1px solid hsl(210, 18%, 15%)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "12px",
  };

  // Customer dashboard
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || "Guest"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover discounted products & help reduce food waste</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Available" value={products.length} icon={Package} subtitle="Products in store" />
          <StatCard title="Discounted" value={analyses.filter(a => a.discountPercent > 0).length} icon={IndianRupee} variant="success" subtitle="Near-expiry deals" />
          <StatCard title="My Orders" value={orders.length} icon={ShoppingBag} subtitle="Total placed" />
        </div>

        <div className="glass-card rounded-xl">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="text-sm font-semibold">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No orders yet. Browse the marketplace to get started!</p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm hover:bg-muted/60 transition-colors">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <span className="text-muted-foreground ml-2 text-xs">· {o.quantity} items</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm">₹{o.total_price.toFixed(2)}</span>
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-md font-medium",
                        o.status === "confirmed" || o.status === "delivered"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin dashboard
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered food waste decision intelligence</p>
        </div>
        <button
          onClick={() => generateWasteReport({ stats, analyses, redirections: [], totalUnitsDonated: 0, uniqueNGOs: 0 })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <FileDown className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={stats.totalItems} icon={Package} subtitle="In database" />
        <StatCard title="At Risk" value={stats.atRisk} icon={AlertTriangle} variant="danger" subtitle="Need attention" />
        <StatCard title="Food Saved" value={`${sustainability.totalFoodSavedKg} kg`} icon={Leaf} variant="success" subtitle="Through AI actions" />
        <StatCard title="Revenue Recovered" value={`₹${sustainability.revenueRecovered.toLocaleString()}`} icon={IndianRupee} variant="success" subtitle="From discounts" />
      </div>

      {/* Waste Prediction + Warehouse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Waste Prediction</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Tomorrow", data: wastePrediction.tomorrow, className: "bg-destructive/8 border-destructive/15", labelClass: "text-destructive", icon: AlertTriangle },
              { label: "Next 3 Days", data: wastePrediction.threeDays, className: "bg-warning/8 border-warning/15", labelClass: "text-warning", icon: Clock },
              { label: "This Week", data: wastePrediction.week, className: "bg-muted/60 border-border/50", labelClass: "text-muted-foreground", icon: Package },
            ].map(item => (
              <div key={item.label} className={cn("flex items-center justify-between p-4 rounded-xl border", item.className)}>
                <div>
                  <p className={cn("text-[11px] font-semibold uppercase tracking-wider", item.labelClass)}>{item.label}</p>
                  <p className="text-xl font-bold mt-0.5">{item.data.wasteKg} kg</p>
                  <p className="text-[10px] text-muted-foreground">{item.data.items} items at risk</p>
                </div>
                <item.icon className={cn("h-7 w-7 opacity-20", item.labelClass)} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Warehouse Heatmap</h3>
          </div>
          <div className="space-y-2.5">
            {warehouseData.map(wh => {
              const level = wh.avgRiskScore >= 60 ? "high" : wh.avgRiskScore >= 30 ? "medium" : "low";
              return (
                <div key={wh.name} className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-semibold">{wh.name}</span>
                    </div>
                    <RiskBadge level={level} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="text-muted-foreground">Score <span className="font-bold text-foreground">{wh.avgRiskScore}%</span></div>
                    <div className="text-muted-foreground">Items <span className="font-bold text-foreground">{wh.total}</span></div>
                    <div className="text-muted-foreground">Critical <span className="font-bold text-destructive">{wh.highRisk}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Risk Items */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Top Risk Items</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topRiskItems.map(a => (
            <RiskScoreGauge key={a.product.id} score={a.riskScore} label={a.product.name} />
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold mb-3">Recent Orders <span className="text-muted-foreground font-normal">({orders.length})</span></h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
        ) : (
          <div className="space-y-1.5">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm hover:bg-muted/60 transition-colors">
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{o.quantity} items</span>
                  <span className="font-mono font-bold text-sm">₹{o.total_price.toFixed(2)}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} stroke="none">
                {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Stock vs Demand (3-day)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stockVsDemand} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 13%, 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="stock" fill="hsl(168, 70%, 36%)" radius={[4, 4, 0, 0]} name="Stock" />
              <Bar dataKey="demand" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Demand" />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
