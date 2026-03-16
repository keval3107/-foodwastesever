import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  product_name?: string;
  productImage?: string;
}

const STORAGE_KEY = "wasteless_orders";

function readOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function writeOrdersToStorage(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = () => {
    if (!user) return;
    const allOrders = readOrdersFromStorage();
    const userOrders = allOrders
      .filter(o => o.user_id === user.id)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    setOrders(userOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const createOrder = async (productId: string, quantity: number, totalPrice: number) => {
    if (!user) return false;
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      user_id: user.id,
      product_id: productId,
      quantity,
      total_price: totalPrice,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    const allOrders = readOrdersFromStorage();
    const updated = [newOrder, ...allOrders];
    writeOrdersToStorage(updated);
    setOrders([newOrder, ...orders]);
    return true;
  };

  return { orders, loading, createOrder, refetch: fetchOrders };
}
