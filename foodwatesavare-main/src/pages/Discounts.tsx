import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { analyzeAllProducts } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tag, Clock, Percent, Megaphone, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Discounts() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const allDiscounted = analyzeAllProducts(products).filter(a => a.discountPercent > 0).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  const analyses = allDiscounted.filter(a =>
    a.product.name.toLowerCase().includes(search.toLowerCase()) ||
    a.product.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Discounted Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Near-expiry items with AI-powered smart pricing • Data from database</p>
      </div>

      {analyses.filter(a => a.promotionMessage).length > 0 && (
        <div className="glass-card rounded-xl p-4 mb-6 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI-Generated Promotions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analyses.filter(a => a.promotionMessage).slice(0, 4).map(a => (
              <div key={a.product.id} className="text-xs px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                {a.promotionMessage}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search discounted products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {analyses.map(a => (
          <div key={a.product.id} className="glass-card rounded-xl overflow-hidden animate-slide-up group hover:shadow-lg transition-shadow">
            <div className="relative bg-gradient-to-br from-primary/20 to-accent p-6 flex items-center justify-center">
              <div className="text-center">
                <Tag className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-lg font-bold">{a.product.name}</p>
                <p className="text-xs text-muted-foreground">{a.product.category}</p>
              </div>
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                -{a.discountPercent}%
              </div>
              <div className="absolute top-3 left-3">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                  a.riskScore >= 70 ? "bg-destructive/90 text-destructive-foreground" :
                    a.riskScore >= 40 ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"
                )}>
                  Risk {a.riskScore}%
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-primary">₹{a.discountedPrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">₹{a.product.price.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Clock className={cn("h-3.5 w-3.5", a.daysToExpiry <= 2 ? "text-destructive" : "text-warning")} />
                <span className={cn(a.daysToExpiry <= 2 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                  {a.daysToExpiry <= 0 ? "Expires today!" : a.daysToExpiry === 1 ? "Expires tomorrow" : `${a.daysToExpiry} days left`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Percent className="h-3.5 w-3.5" />
                {a.product.quantity} units available
              </div>

              <p className="text-xs bg-accent rounded-lg px-3 py-2 text-accent-foreground">{a.recommendedAction}</p>

              <button
                onClick={() => {
                  addToCart({
                    productId: a.product.id,
                    name: a.product.name,
                    category: a.product.category,
                    originalPrice: a.product.price,
                    discountedPrice: a.discountedPrice,
                    discountPercent: a.discountPercent,
                    imageUrl: a.product.imageUrl || "",
                  });
                  toast({ title: "Added to cart", description: `${a.product.name} added to your cart.` });
                }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {analyses.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No discounted items right now</p>
          <p className="text-sm">Check back soon for deals on near-expiry products!</p>
        </div>
      )}
    </DashboardLayout>
  );
}
