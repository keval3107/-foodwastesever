import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { analyzeProduct } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Package, Clock, ShoppingCart, TrendingUp, TrendingDown,
  AlertTriangle, BarChart3, Warehouse, Activity, Zap, Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold mb-2">Product not found</p>
          <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const analysis = analyzeProduct(product);

  const demandData = [
    { name: "Current Stock", value: product.quantity, fill: "hsl(var(--primary))" },
    { name: "3-Day Demand", value: analysis.predictedDemand, fill: "hsl(var(--chart-blue))" },
    { name: "Surplus/Deficit", value: Math.abs(product.quantity - analysis.predictedDemand), fill: analysis.isOverstock ? "hsl(var(--warning))" : "hsl(var(--primary))" },
  ];

  const riskPieData = [
    { name: "Risk", value: analysis.riskScore, fill: analysis.riskLevel === "high" ? "hsl(var(--destructive))" : analysis.riskLevel === "medium" ? "hsl(var(--warning))" : "hsl(var(--primary))" },
    { name: "Safe", value: 100 - analysis.riskScore, fill: "hsl(var(--muted))" },
  ];

  const velocityData = [
    { name: "Daily Avg Sales", value: product.dailySalesAvg },
    { name: "Stock / Day", value: analysis.daysToExpiry > 0 ? Math.round(product.quantity / analysis.daysToExpiry) : product.quantity },
  ];

  return (
    <DashboardLayout>
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center flex-shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <Package className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">{product.category}</span>
                <RiskBadge level={analysis.riskLevel} />
                {analysis.isOverstock && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-warning/10 text-warning border border-warning/20 font-medium flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Overstock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {analysis.discountPercent > 0 ? (
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">₹{analysis.discountedPrice.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                </div>
                <span className="text-xs font-semibold text-destructive">-{analysis.discountPercent}% off</span>
              </div>
            ) : (
              <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
            )}
            <button
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  category: product.category,
                  originalPrice: product.price,
                  discountedPrice: analysis.discountPercent > 0 ? analysis.discountedPrice : product.price,
                  discountPercent: analysis.discountPercent,
                  imageUrl: product.imageUrl || "",
                });
                toast({ title: "Added to cart", description: `${product.name} added.` });
              }}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Days to Expiry", value: analysis.daysToExpiry <= 0 ? "Expired" : `${analysis.daysToExpiry}d`, icon: Clock, color: analysis.daysToExpiry <= 2 ? "text-destructive" : "text-primary" },
          { label: "Stock Qty", value: product.quantity, icon: Package, color: "text-foreground" },
          { label: "Risk Score", value: `${analysis.riskScore}%`, icon: Activity, color: analysis.riskScore >= 70 ? "text-destructive" : analysis.riskScore >= 40 ? "text-warning" : "text-primary" },
          { label: "Waste Risk", value: `${analysis.wasteRiskKg} kg`, icon: AlertTriangle, color: analysis.wasteRiskKg > 10 ? "text-destructive" : "text-muted-foreground" },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Analysis */}
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Risk Analysis
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskPieData} innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {riskPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <div className="mt-1"><RiskBadge level={analysis.riskLevel} /></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiry Countdown</p>
                <p className="text-sm font-semibold">{analysis.expiryHours} hours remaining</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sales Velocity</p>
                <p className="text-sm font-semibold">{(analysis.salesVelocity * 100).toFixed(1)}% daily turnover</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demand Prediction */}
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Demand Prediction (3-Day)
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={demandData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-2 text-xs">
            {analysis.isOverstock ? (
              <span className="flex items-center gap-1 text-warning font-medium"><TrendingDown className="h-3 w-3" /> Surplus of {product.quantity - analysis.predictedDemand} units</span>
            ) : (
              <span className="flex items-center gap-1 text-primary font-medium"><TrendingUp className="h-3 w-3" /> Demand exceeds stock by {analysis.predictedDemand - product.quantity} units</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Actions & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "220ms" }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> AI Recommendations
          </h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Recommended Action</p>
              <p className="text-sm font-medium">{analysis.recommendedAction}</p>
            </div>
            {analysis.promotionMessage && (
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <p className="text-xs text-muted-foreground mb-1">Promotion Message</p>
                <p className="text-sm font-medium">{analysis.promotionMessage}</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Procurement Advice</p>
              <p className="text-sm font-medium">{analysis.procurementAdvice}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: "280ms" }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-primary" /> Product Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Warehouse", value: product.warehouse },
              { label: "Daily Sales Avg", value: `${product.dailySalesAvg} units/day` },
              { label: "Overstock Ratio", value: `${analysis.overstockRatio.toFixed(2)}x` },
              { label: "Expiry Date", value: product.expiryDate },
              { label: "Predicted 3-Day Demand", value: `${analysis.predictedDemand} units` },
              { label: "Estimated Waste", value: `${analysis.wasteRiskKg} kg` },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Sustainability */}
          <div className="mt-5 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Environmental Impact</p>
              <p className="text-sm font-medium">Buying this saves ~{(product.quantity * 0.5 * 2.5).toFixed(1)} kg CO₂ from waste</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
