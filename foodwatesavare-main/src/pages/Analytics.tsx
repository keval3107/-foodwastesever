import { useProducts } from "@/hooks/useProducts";
import { analyzeAllProducts, getStats, getSustainabilityMetrics, getWarehouseRiskData, getWastePrediction } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Package, AlertTriangle, Leaf, IndianRupee, Download, Factory, Utensils, Droplets, Warehouse, Gauge, Zap, BarChart3 } from "lucide-react";
import { exportAnalyticsCSV } from "@/lib/csvExport";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RISK_COLORS = ["hsl(0, 72%, 51%)", "hsl(30, 90%, 50%)", "hsl(168, 70%, 36%)"];

const tooltipStyle = {
  background: "hsl(210, 25%, 8%)",
  border: "1px solid hsl(210, 18%, 15%)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "12px",
};

export default function Analytics() {
  const { products } = useProducts();
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

  const categoryData = Object.entries(
    analyses.reduce<Record<string, { total: number; atRisk: number }>>((acc, a) => {
      const cat = a.product.category;
      if (!acc[cat]) acc[cat] = { total: 0, atRisk: 0 };
      acc[cat].total++;
      if (a.riskLevel !== "low") acc[cat].atRisk++;
      return acc;
    }, {})
  ).map(([name, data]) => ({ name, ...data }));

  const riskScoreData = [
    { range: "0-20", count: analyses.filter(a => a.riskScore <= 20).length },
    { range: "21-40", count: analyses.filter(a => a.riskScore > 20 && a.riskScore <= 40).length },
    { range: "41-60", count: analyses.filter(a => a.riskScore > 40 && a.riskScore <= 60).length },
    { range: "61-80", count: analyses.filter(a => a.riskScore > 60 && a.riskScore <= 80).length },
    { range: "81-100", count: analyses.filter(a => a.riskScore > 80).length },
  ];

  const warehouseChartData = warehouseData.map(w => ({
    name: w.name.replace("Warehouse ", "WH "),
    riskScore: w.avgRiskScore,
    wasteKg: w.totalWasteKg,
  }));

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time intelligence from database</p>
          </div>
        </div>
        <button onClick={() => exportAnalyticsCSV(analyses)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={stats.totalItems} icon={Package} />
        <StatCard title="At Risk" value={stats.atRisk} icon={AlertTriangle} variant="danger" />
        <StatCard title="Food Saved" value={`${sustainability.totalFoodSavedKg} kg`} icon={Leaf} variant="success" />
        <StatCard title="Revenue Recovered" value={`₹${sustainability.revenueRecovered.toLocaleString()}`} icon={IndianRupee} variant="success" />
      </div>

      {/* Environmental Impact */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Environmental Impact</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Factory, value: `${sustainability.co2Prevented} kg`, label: "CO₂ Prevented", bg: "bg-primary/8" },
            { icon: Utensils, value: sustainability.mealsEquivalent, label: "Meals Equivalent", bg: "bg-accent/60" },
            { icon: Droplets, value: `${(sustainability.waterSavedLiters / 1000).toFixed(1)}k L`, label: "Water Saved", bg: "bg-accent/60" },
            { icon: Leaf, value: `${sustainability.totalFoodSavedKg} kg`, label: "Food Saved", bg: "bg-accent/60" },
          ].map(item => (
            <div key={item.label} className={`p-4 rounded-xl ${item.bg} text-center`}>
              <item.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-xl font-bold text-primary">{item.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predicted Waste */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Predicted Waste</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-destructive/8 border border-destructive/15 text-center">
            <p className="text-[11px] font-semibold text-destructive uppercase tracking-wider">Tomorrow</p>
            <p className="text-2xl font-bold mt-1">{wastePrediction.tomorrow.wasteKg} kg</p>
            <p className="text-[10px] text-muted-foreground">{wastePrediction.tomorrow.items} items</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/8 border border-warning/15 text-center">
            <p className="text-[11px] font-semibold text-warning uppercase tracking-wider">3 Days</p>
            <p className="text-2xl font-bold mt-1">{wastePrediction.threeDays.wasteKg} kg</p>
            <p className="text-[10px] text-muted-foreground">{wastePrediction.threeDays.items} items</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/60 border border-border/50 text-center">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">This Week</p>
            <p className="text-2xl font-bold mt-1">{wastePrediction.week.wasteKg} kg</p>
            <p className="text-[10px] text-muted-foreground">{wastePrediction.week.items} items</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={4} stroke="none">
                {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Risk Score Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 13%, 18%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 13%, 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="total" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="atRisk" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="At Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Warehouse Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={warehouseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 13%, 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(210, 10%, 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="riskScore" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Risk Score" />
              <Bar dataKey="wasteKg" fill="hsl(30, 90%, 50%)" radius={[4, 4, 0, 0]} name="Waste (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
