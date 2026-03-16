import { Leaf, LayoutDashboard, Package, AlertTriangle, BarChart3, Tag, Menu, LogOut, ShoppingCart, Sun, Moon, Store, Receipt, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const adminLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/risks", label: "Risk Monitor", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const userLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/discounts", label: "Deals", icon: Tag },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : userLinks;
  const roleLabel = isAdmin ? "Admin" : "Customer";

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-card border border-border shadow-sm"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col bg-sidebar transition-all duration-300 border-r border-sidebar-border",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[68px]" : "md:w-48"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary/20 flex-shrink-0">
            <Leaf className="h-4 w-4 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[13px] font-bold text-sidebar-accent-foreground tracking-tight leading-none">WasteLess AI</h1>
              <p className="text-[10px] text-sidebar-foreground mt-0.5">Food Waste Intelligence</p>
            </div>
          )}
          <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-[52px] w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-[10px] text-muted-foreground hover:text-foreground hover:bg-card transition-colors shadow-sm z-50"
        >
          {collapsed ? "›" : "‹"}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest px-3 mb-2">
              {isAdmin ? "Admin" : "Menu"}
            </p>
          )}
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {link.to === "/cart" && totalItems > 0 && (
                <span className={cn(
                  "bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center",
                  collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                )}>
                  {totalItems}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-2 mb-1">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center"
            )}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>

        {/* User section */}
        <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-3")}>
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-sidebar-accent-foreground truncate">{user?.name || "Guest"}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-semibold",
                      isAdmin ? "bg-sidebar-primary/15 text-sidebar-primary" : "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}>
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
