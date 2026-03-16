import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { analyzeAllProducts } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, Search, Clock, ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categoryVisuals: Record<string, { emoji: string; gradient: string }> = {
  Dairy: { emoji: "🥛", gradient: "from-blue-100 to-sky-50 dark:from-blue-950/40 dark:to-sky-900/20" },
  Bakery: { emoji: "🍞", gradient: "from-amber-100 to-orange-50 dark:from-amber-950/40 dark:to-orange-900/20" },
  Vegetables: { emoji: "🥬", gradient: "from-green-100 to-emerald-50 dark:from-green-950/40 dark:to-emerald-900/20" },
  Fruits: { emoji: "🍎", gradient: "from-red-100 to-pink-50 dark:from-red-950/40 dark:to-pink-900/20" },
  "Ready-to-eat": { emoji: "🍱", gradient: "from-violet-100 to-purple-50 dark:from-violet-950/40 dark:to-purple-900/20" },
  Beverages: { emoji: "🧃", gradient: "from-cyan-100 to-teal-50 dark:from-cyan-950/40 dark:to-teal-900/20" },
  Snacks: { emoji: "🍿", gradient: "from-yellow-100 to-amber-50 dark:from-yellow-950/40 dark:to-amber-900/20" },
};

const defaultVisual = { emoji: "📦", gradient: "from-muted/80 to-accent/40" };

export default function Marketplace() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const analyses = analyzeAllProducts(products);
  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filtered = analyses.filter(a => {
    const matchSearch = a.product.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || a.product.category === category;
    return matchSearch && matchCat && a.daysToExpiry >= 0;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Fresh products · Discounted near-expiry items marked with savings</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
                category === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((a, idx) => (
          <div
            key={a.product.id}
            className="glass-card rounded-xl overflow-hidden animate-slide-up transition-all hover:shadow-md"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div
              className={cn("relative overflow-hidden min-h-[180px] cursor-pointer transition-transform hover:scale-[1.02]",
                a.product.imageUrl
                  ? "bg-muted"
                  : `bg-gradient-to-br ${(categoryVisuals[a.product.category] || defaultVisual).gradient}`
              )}
              onClick={() => navigate(`/product/${a.product.id}`)}
            >
              {a.product.imageUrl ? (
                <img
                  src={a.product.imageUrl}
                  alt={a.product.name}
                  className="w-full h-full object-cover absolute inset-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full p-6">
                  <span className="text-5xl drop-shadow-sm">
                    {(categoryVisuals[a.product.category] || defaultVisual).emoji}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <p className="text-sm font-bold text-white leading-tight">{a.product.name}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{a.product.category}</p>
              </div>
              {a.discountPercent > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  -{a.discountPercent}%
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                {a.discountPercent > 0 ? (
                  <>
                    <span className="text-lg font-bold text-primary">₹{a.discountedPrice.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{a.product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold">₹{a.product.price.toFixed(2)}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className={cn("h-3 w-3", a.daysToExpiry <= 2 ? "text-destructive" : "")} />
                  {a.daysToExpiry === 1 ? "Expires tomorrow" : `${a.daysToExpiry}d left`}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {a.product.quantity} in stock
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart({
                    productId: a.product.id,
                    name: a.product.name,
                    category: a.product.category,
                    originalPrice: a.product.price,
                    discountedPrice: a.discountPercent > 0 ? a.discountedPrice : a.product.price,
                    discountPercent: a.discountPercent,
                    imageUrl: a.product.imageUrl || "",
                  });
                  toast({ title: "Added to cart", description: `${a.product.name} added.` });
                }}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-lg font-semibold mb-1">No products found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
