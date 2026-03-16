import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, TrendingDown, ShoppingCart, BarChart3, Sparkles, ArrowRight, Recycle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">WasteLess AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Food Waste Prevention
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Reduce Food Waste.
          <br />
          <span className="text-primary">Save Money & Planet.</span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          WasteLess AI uses smart expiry tracking, dynamic pricing, and demand prediction to help businesses minimize food waste and maximize savings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-base">
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition-all text-base">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Food Saved", value: "2.5T+", icon: Recycle },
            { label: "CO₂ Prevented", value: "6.2T kg", icon: Leaf },
            { label: "Revenue Recovered", value: "₹12L+", icon: TrendingDown },
            { label: "Products Tracked", value: "50K+", icon: BarChart3 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-6 text-center">
              <s.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <p className="text-xl md:text-2xl lg:text-3xl font-extrabold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Smart AI algorithms analyze your inventory in real-time to prevent waste before it happens.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Risk Detection",
                desc: "AI scans expiry dates, stock levels, and demand patterns to flag at-risk products instantly.",
              },
              {
                icon: TrendingDown,
                title: "Dynamic Discounts",
                desc: "Auto-generated discount suggestions based on shelf life and predicted demand to move products fast.",
              },
              {
                icon: ShoppingCart,
                title: "Smart Marketplace",
                desc: "Customers get discounted near-expiry products — reducing waste while saving money.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-card border border-border p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to fight food waste?</h2>
          <p className="text-muted-foreground mb-8">Join businesses saving thousands while protecting the environment.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-base">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          <span>© 2026 WasteLess AI. Reducing food waste with intelligence.</span>
        </div>
      </footer>
    </div>
  );
}