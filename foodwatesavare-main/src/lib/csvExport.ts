import { Product } from "@/data/mockData";
import { ProductAnalysis } from "@/lib/wasteless";

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportInventoryCSV(analyses: ProductAnalysis[]) {
  const headers = ["Name", "Category", "Quantity", "Price", "Expiry Date", "Warehouse", "Daily Sales Avg", "Days to Expiry", "Risk Level", "Discount %", "Discounted Price", "Recommendation"];
  const rows = analyses.map(a => [
    a.product.name,
    a.product.category,
    a.product.quantity,
    a.product.price.toFixed(2),
    a.product.expiryDate,
    a.product.warehouse,
    a.product.dailySalesAvg,
    a.daysToExpiry,
    a.riskLevel,
    a.discountPercent,
    a.discountedPrice.toFixed(2),
    `"${a.recommendedAction}"`,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadCSV(`inventory_${new Date().toISOString().split("T")[0]}.csv`, csv);
}

export function exportAnalyticsCSV(analyses: ProductAnalysis[]) {
  const headers = ["Name", "Category", "Stock", "Predicted Demand (3d)", "Risk Level", "Is Overstock", "Discount %", "Est. Revenue (discounted)"];
  const rows = analyses.map(a => [
    a.product.name,
    a.product.category,
    a.product.quantity,
    a.predictedDemand,
    a.riskLevel,
    a.isOverstock ? "Yes" : "No",
    a.discountPercent,
    (a.discountedPrice * Math.min(a.product.quantity, a.predictedDemand)).toFixed(2),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadCSV(`analytics_${new Date().toISOString().split("T")[0]}.csv`, csv);
}
