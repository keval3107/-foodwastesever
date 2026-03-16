import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Leaf, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await register(email, password, name);
    if (result.success) {
      toast({ title: "Account created!", description: `Welcome, ${name}!` });
      navigate("/");
    } else {
      toast({ title: "Registration failed", description: result.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[380px]">
        <div className="glass-card rounded-2xl p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Create Account</h1>
            <p className="text-xs text-muted-foreground mt-1">Join WasteLess AI and reduce food waste</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} required maxLength={100} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required maxLength={255} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputClass} required minLength={6} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputClass} required minLength={6} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
