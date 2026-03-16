import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockProducts, type Product } from "@/data/mockData";

function mapDbProduct(row: any): Product {
  const mock = mockProducts.find(p => p.id === row.id);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    price: Number(row.price),
    expiryDate: row.expiry_date,
    warehouse: row.warehouse,
    dailySalesAvg: row.daily_sales_avg,
    imageUrl: row.image_url || mock?.imageUrl || "",
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data.map(mapDbProduct));
      } else {
        setProducts(mockProducts);
      }
    } catch {
      setProducts(mockProducts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    const { error } = await supabase.from("products").insert({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      expiry_date: product.expiryDate,
      warehouse: product.warehouse,
      daily_sales_avg: product.dailySalesAvg,
      image_url: product.imageUrl,
    });
    return !error;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.warehouse !== undefined) dbUpdates.warehouse = updates.warehouse;
    if (updates.dailySalesAvg !== undefined) dbUpdates.daily_sales_avg = updates.dailySalesAvg;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { error } = await supabase.from("products").update(dbUpdates).eq("id", id);
    return !error;
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return !error;
  };

  return { products, loading, addProduct, updateProduct, removeProduct, refetch: fetchProducts };
}
