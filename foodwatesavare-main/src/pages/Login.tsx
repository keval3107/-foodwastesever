import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, LogIn, Mail, Lock, ShieldCheck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type LoginMode = "admin" | "user";

export default function Login() {
  const { login, adminLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result;
    if (mode === "admin") {
      result = await adminLogin(username, password);
    } else {
      result = await login(email, password);
    }
    if (result.success) {
      toast({ title: "Welcome back!", description: "Logged in successfully" });
      navigate("/");
    } else {
      toast({ title: "Login failed", description: result.error || "Invalid credentials", variant: "destructive" });
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[380px]">
        <div className="glass-card rounded-2xl p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">WasteLess AI</h1>
            <p className="text-xs text-muted-foreground mt-1">Food Waste Reduction Platform</p>
          </div>

          <div className="mb-6">
            <label className="text-[11px] font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Sign in as</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "user" as const, label: "Customer", icon: User },
                { key: "admin" as const, label: "Admin", icon: ShieldCheck },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setMode(opt.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium",
                    mode === opt.key
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "admin" ? (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" className={inputClass} required />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
                </div>
              </div>
            )}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className={inputClass} required />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in..." : `Sign In`}
            </button>
          </form>

          {mode === "admin" && (
            <div className="mt-4 p-3 rounded-lg bg-muted/60 border border-border/50">
              <p className="text-[10px] text-muted-foreground text-center">
                Demo: username <span className="font-mono font-bold text-foreground">admin</span> · password <span className="font-mono font-bold text-foreground">WasteLess@2025</span>
              </p>
            </div>
          )}

          <div className="mt-5 text-center">
            <Link to="/register" className="text-xs text-primary hover:underline font-medium">
              New user? Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
