import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, Clock, CheckCircle2, Truck, Search, Receipt, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/20" },
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  delivered: { label: "Delivered", icon: Truck, className: "bg-chart-blue/10 text-chart-blue border-chart-blue/20" },
  cancelled: { label: "Cancelled", icon: Package, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function OrderHistory() {
  const { orders, loading } = useOrders();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const productMap = new Map(products.map(p => [p.id, p]));

  const enrichedOrders = orders.map(o => ({
    ...o,
    productName: productMap.get(o.product_id)?.name || "Unknown Product",
    productCategory: productMap.get(o.product_id)?.category || "",
    productImage: productMap.get(o.product_id)?.imageUrl || "",
  }));

  const filtered = enrichedOrders.filter(o => {
    const matchSearch = o.productName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = filtered.reduce((s, o) => s + o.total_price, 0);
  const statuses = ["all", ...new Set(orders.map(o => o.status))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""} · ₹{totalSpent.toFixed(2)} total
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by product or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
                statusFilter === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-lg font-semibold mb-1">No orders found</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {orders.length === 0
              ? "You haven't placed any orders yet. Browse the marketplace to get started!"
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, idx) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div
                key={order.id}
                className="group glass-card rounded-xl p-5 hover:border-primary/20 transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {order.productImage ? (
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm truncate">{order.productName}</h3>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">#{order.id.slice(0, 8)}</span>
                        <span>·</span>
                        <span>{order.productCategory}</span>
                        <span>·</span>
                        <span>{format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Qty</p>
                      <p className="text-sm font-mono font-semibold">{order.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-mono font-bold text-primary">₹{order.total_price.toFixed(2)}</p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium", config.className)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {config.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div className="mt-8 p-5 rounded-xl bg-muted/50 border border-border/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{filtered.length}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">₹{totalSpent.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{filtered.reduce((s, o) => s + o.quantity, 0)}</p>
              <p className="text-xs text-muted-foreground">Items Purchased</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{filtered.filter(o => o.status === "confirmed" || o.status === "delivered").length}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
