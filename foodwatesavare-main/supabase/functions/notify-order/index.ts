import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, user_id, order_id, product_name, quantity, total_price } = await req.json();

    if (type === "order_placed") {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user_id)
        .single();

      // Log notification (in production, integrate with email provider)
      console.log(`📧 ORDER CONFIRMATION for ${profile?.name || "User"}:`);
      console.log(`  Order #${order_id?.slice(0, 8)}`);
      console.log(`  Product: ${product_name}`);
      console.log(`  Quantity: ${quantity}`);
      console.log(`  Total: ₹${total_price}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Order confirmation sent to ${profile?.name || "user"}`,
          notification: {
            type: "order_placed",
            recipient: profile?.name,
            order_id,
            product_name,
            quantity,
            total_price,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "expiry_alert") {
      // Fetch all high-risk products (expiring within 2 days)
      const { data: products } = await supabase.from("products").select("*");

      const now = new Date();
      const criticalProducts = (products || []).filter((p: any) => {
        const expiry = new Date(p.expiry_date);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 2 && daysLeft >= 0;
      });

      // Fetch admin profiles
      const { data: admins } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "admin");

      console.log(`🚨 CRITICAL EXPIRY ALERT — ${criticalProducts.length} product(s) at risk:`);
      criticalProducts.forEach((p: any) => {
        const daysLeft = Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  ⚠️ ${p.name} — ${daysLeft <= 0 ? "EXPIRED" : `${daysLeft} day(s) left`} — ${p.quantity} units`);
      });

      if (admins?.length) {
        console.log(`  Notifying admin(s): ${admins.map((a: any) => a.name).join(", ")}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Expiry alert processed for ${criticalProducts.length} product(s)`,
          critical_products: criticalProducts.map((p: any) => ({
            name: p.name,
            expiry_date: p.expiry_date,
            quantity: p.quantity,
            days_left: Math.ceil((new Date(p.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          })),
          admins_notified: admins?.map((a: any) => a.name) || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid notification type. Use 'order_placed' or 'expiry_alert'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
