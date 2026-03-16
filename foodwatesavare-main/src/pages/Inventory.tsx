import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { analyzeAllProducts } from "@/lib/wasteless";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { categories, warehouses } from "@/data/mockData";
import { Plus, Trash2, Search, Download, Clock, Edit2, X, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportInventoryCSV } from "@/lib/csvExport";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { toast } = useToast();
  const analyses = analyzeAllProducts(products);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: categories[0], quantity: "", price: "", expiryDate: "", warehouse: warehouses[0], dailySalesAvg: "" });
  const [editForm, setEditForm] = useState({ quantity: "", price: "" });

  const filtered = analyses.filter(a =>
    a.product.name.toLowerCase().includes(search.toLowerCase()) ||
    a.product.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.quantity || !form.price || !form.expiryDate || !form.dailySalesAvg) return;
    const success = await addProduct({
      name: form.name, category: form.category, quantity: parseInt(form.quantity),
      price: parseFloat(form.price), expiryDate: form.expiryDate, warehouse: form.warehouse,
      dailySalesAvg: parseInt(form.dailySalesAvg),
    });
    if (success) {
      toast({ title: "Product added", description: `${form.name} added to inventory.` });
      setForm({ name: "", category: categories[0], quantity: "", price: "", expiryDate: "", warehouse: warehouses[0], dailySalesAvg: "" });
      setShowForm(false);
    } else {
      toast({ title: "Error adding product", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    const updates: any = {};
    if (editForm.quantity) updates.quantity = parseInt(editForm.quantity);
    if (editForm.price) updates.price = parseFloat(editForm.price);
    const success = await updateProduct(id, updates);
    if (success) { toast({ title: "Product updated" }); setEditingId(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    const success = await removeProduct(id);
    if (success) toast({ title: "Product deleted", description: `${name} removed.` });
  };

  const inputClass = "px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-sm text-muted-foreground">{products.length} products in database</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportInventoryCSV(analyses)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-5 mb-5 animate-slide-up">
          <h3 className="text-sm font-semibold mb-3">New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className={inputClass} />
            <input type="number" step="0.01" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputClass} />
            <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className={inputClass} />
            <select value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} className={inputClass}>
              {warehouses.map(w => <option key={w}>{w}</option>)}
            </select>
            <input type="number" placeholder="Daily Sales Avg" value={form.dailySalesAvg} onChange={e => setForm({ ...form, dailySalesAvg: e.target.value })} className={inputClass} />
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50">
                {["Product", "Category", "Qty", "Price", "Expiry", "Warehouse", "Score", "Risk", "Action", ""].map(h => (
                  <th key={h} className="text-left py-3 px-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={a.product.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3.5 font-semibold text-[13px]">{a.product.name}</td>
                  <td className="py-3 px-3.5 text-muted-foreground text-xs">{a.product.category}</td>
                  <td className="py-3 px-3.5 font-mono text-xs">
                    {editingId === a.product.id ? (
                      <input type="number" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} className="w-16 px-1.5 py-1 rounded-md bg-muted border border-border text-xs" />
                    ) : a.product.quantity}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-xs">
                    {editingId === a.product.id ? (
                      <input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-20 px-1.5 py-1 rounded-md bg-muted border border-border text-xs" />
                    ) : `₹${a.product.price.toFixed(2)}`}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className={cn("h-3 w-3", a.expiryHours <= 24 ? "text-destructive" : "text-muted-foreground")} />
                      {a.daysToExpiry <= 0 ? <span className="text-destructive font-semibold">Expired</span> : <span>{a.daysToExpiry}d</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-muted-foreground text-xs">{a.product.warehouse}</td>
                  <td className="py-3 px-3.5">
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md",
                      a.riskScore >= 70 ? "bg-destructive/10 text-destructive" :
                      a.riskScore >= 40 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                    )}>{a.riskScore}%</span>
                  </td>
                  <td className="py-3 px-3.5"><RiskBadge level={a.riskLevel} /></td>
                  <td className="py-3 px-3.5 text-[11px] max-w-[180px] text-muted-foreground leading-tight">{a.recommendedAction}</td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-0.5">
                      {editingId === a.product.id ? (
                        <>
                          <button onClick={() => handleUpdate(a.product.id)} className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(a.product.id); setEditForm({ quantity: String(a.product.quantity), price: String(a.product.price) }); }} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(a.product.id, a.product.name)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
