import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ShoppingCart, Trash2, Minus, Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast({ title: "Select a payment method", description: "Please choose how you'd like to pay.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "UPI" && !upiId.trim()) {
      toast({ title: "Enter your UPI ID", description: "We need your UPI ID to complete payment.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "Card") {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        toast({ title: "Enter card details", description: "Please fill in all card fields.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    let allSuccess = true;
    for (const item of items) {
      const success = await createOrder(item.productId, item.quantity, item.discountedPrice * item.quantity);
      if (!success) allSuccess = false;
      else {
        // Send order notification (fire-and-forget)
        supabase.functions.invoke("notify-order", {
          body: {
            type: "order_placed",
            user_id: user?.id,
            product_name: item.name,
            quantity: item.quantity,
            total_price: (item.discountedPrice * item.quantity).toFixed(2),
            payment_method: paymentMethod,
            payment_details: paymentMethod === "UPI" ? upiId : paymentMethod === "Card" ? `${cardNumber.slice(-4)} (card)` : "",
          },
        }).catch(() => { });
      }
    }
    if (allSuccess) {
      clearCart();
      setOrderPlaced(paymentMethod);
      toast({ title: "✅ Order Placed!", description: `₹${totalPrice.toFixed(2)} — Thank you for reducing food waste!` });
    } else {
      toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Your purchase helps reduce food waste. Order saved locally.</p>
          <p className="text-sm text-muted-foreground mb-6">Payment method: <span className="font-medium text-foreground">{orderPlaced}</span></p>
          <button onClick={() => setOrderPlaced(null)} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Continue Shopping
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm">Browse products to add items to your cart.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.productId} className="glass-card rounded-xl p-4 flex items-start gap-4 animate-slide-up">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">₹{item.discountedPrice.toFixed(2)}</span>
                    {item.discountPercent > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice.toFixed(2)}</span>
                        <span className="text-xs font-semibold text-destructive">-{item.discountPercent}%</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-bold">₹{(item.discountedPrice * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You save</span>
                  <span className="text-primary font-medium">
                    ₹{items.reduce((s, i) => s + (i.originalPrice - i.discountedPrice) * i.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>

                {paymentMethod === "UPI" && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="example@upi"
                      className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}

                {paymentMethod === "Card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Cardholder name</label>
                      <input
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Card number</label>
                      <input
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Expiry</label>
                        <input
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">CVV</label>
                        <input
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Placing order..." : `Place Order — ₹${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
